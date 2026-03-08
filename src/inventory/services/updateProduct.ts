import { dbPool } from '../../config/database.js';

export const updateProduct = async (id: number | string, data: { name: string, price: number, cost_price?: number, category: string, stock: number, image?: string }) => {
    const result = await dbPool.query(
        "UPDATE products SET name = $1, price = $2, cost_price = $3, category = $4, stock = $5, image = $6 WHERE id = $7 RETURNING *",
        [data.name, data.price, data.cost_price || 0, data.category, data.stock, data.image || '', id]
    );
    return result.rows[0];
};
