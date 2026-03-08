import { dbPool } from '../../config/database.js';

export const createProduct = async (name: string, price: number, category: string, stock: number = 0, image: string = '', costPrice: number = 0) => {
    const result = await dbPool.query(
        "INSERT INTO products (name, price, cost_price, category, stock, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [name, price, costPrice, category, stock, image]
    );
    return result.rows[0];
};
