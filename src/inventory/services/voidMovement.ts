import { dbPool } from '../../config/database.js';

export const voidMovement = async (movementId: number) => {
    const client = await dbPool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get movement details
        const movementRes = await client.query('SELECT * FROM inventory_movements WHERE id = $1', [movementId]);
        if (movementRes.rowCount === 0) throw new Error('Movimiento no encontrado');
        const movement = movementRes.rows[0];

        // 2. Adjust product stock
        if (movement.type === 'in') {
            await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [movement.quantity, movement.product_id]);
        } else {
            await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [movement.quantity, movement.product_id]);
        }

        // 3. Delete associated expense if it exists
        if (movement.expense_id) {
            await client.query('DELETE FROM expenses WHERE id = $1', [movement.expense_id]);
        }

        // 4. Delete the movement itself
        await client.query('DELETE FROM inventory_movements WHERE id = $1', [movementId]);

        await client.query('COMMIT');
        return { success: true, message: 'Movimiento anulado correctamente' };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in voidMovement:', error);
        throw error;
    } finally {
        client.release();
    }
};
