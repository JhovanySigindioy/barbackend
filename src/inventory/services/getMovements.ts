import { dbPool } from '../../config/database.js';

export const getMovements = async (productId?: number) => {
    let query = `
        SELECT m.*, p.name as product_name 
        FROM inventory_movements m
        JOIN products p ON m.product_id = p.id
    `;
    const params = [];

    if (productId) {
        query += ` WHERE m.product_id = $1`;
        params.push(productId);
    }

    query += ` ORDER BY m.created_at DESC LIMIT 50`;

    const result = await dbPool.query(query, params);
    return result.rows;
};
