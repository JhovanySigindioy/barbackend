import { dbPool } from '../../config/database.js';

export const createProduct = async (
    name: string,
    price: number,
    category: string,
    initialStock: number = 0,
    image: string = '',
    costPrice: number = 0
) => {
    const client = await dbPool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create product
        const result = await client.query(
            "INSERT INTO products (name, price, cost_price, category, stock, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [name, price, costPrice, category, initialStock, image]
        );
        const product = result.rows[0];

        // 2. If there's initial stock, record movement and expense
        if (initialStock > 0) {
            const totalCost = initialStock * costPrice;

            await client.query(
                'INSERT INTO inventory_movements (product_id, type, quantity, reason, unit_cost, total_cost) VALUES ($1, $2, $3, $4, $5, $6)',
                [product.id, 'in', initialStock, 'initial_stock', costPrice, totalCost]
            );

            await client.query(
                'INSERT INTO expenses (description, amount, category, date) VALUES ($1, $2, $3, CURRENT_DATE)',
                [`Inversión inicial: ${initialStock} x ${name}`, totalCost, 'Suministros']
            );
        }

        await client.query('COMMIT');
        return product;
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error creating product with stock:', e);
        throw e;
    } finally {
        client.release();
    }
};
