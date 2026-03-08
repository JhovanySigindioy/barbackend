import { dbPool } from '../../config/database.js';

export const deleteProduct = async (id: number | string) => {
    const result = await dbPool.query(
        "DELETE FROM products WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0];
};
