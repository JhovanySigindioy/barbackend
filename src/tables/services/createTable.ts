import { dbPool } from '../../config/database.js';

export const createTable = async (number: string, capacity: number) => {
    const result = await dbPool.query(
        "INSERT INTO tables (number, capacity) VALUES ($1, $2) RETURNING *",
        [number, capacity]
    );
    return result.rows[0];
};
