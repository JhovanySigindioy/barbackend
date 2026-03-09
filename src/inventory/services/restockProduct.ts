import { dbPool } from '../../config/database.js';

interface RestockData {
    productId: number;
    quantity: number;
    unitCost: number;
    reason?: string;
}

export const restockProduct = async ({ productId, quantity, unitCost, reason = 'purchase' }: RestockData) => {
    const client = await dbPool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get product current info
        const productRes = await client.query('SELECT name, stock FROM products WHERE id = $1', [productId]);
        if (productRes.rowCount === 0) throw new Error('Producto no encontrado');
        const product = productRes.rows[0];

        // 2. Update product stock and cost_price
        await client.query(
            'UPDATE products SET stock = stock + $1, cost_price = $2 WHERE id = $3',
            [quantity, unitCost, productId]
        );

        // 3. Automatically record as an expense first to get the ID
        const totalCost = quantity * unitCost;
        const expenseRes = await client.query(
            'INSERT INTO expenses (description, amount, category, date) VALUES ($1, $2, $3, CURRENT_DATE) RETURNING id',
            [`Compra Inventario: ${quantity} x ${product.name}`, totalCost, 'Suministros']
        );
        const expenseId = expenseRes.rows[0].id;

        // 4. Register inventory movement linked to the expense
        await client.query(
            'INSERT INTO inventory_movements (product_id, type, quantity, reason, unit_cost, total_cost, expense_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [productId, 'in', quantity, reason, unitCost, totalCost, expenseId]
        );

        await client.query('COMMIT');
        return { success: true, message: 'Inventario actualizado correctamente' };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in restock:', error);
        throw error;
    } finally {
        client.release();
    }
};
