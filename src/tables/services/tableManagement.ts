import { dbPool } from '../../config/database.js';

export const updateTable = async (id: number | string, data: { number: string, capacity: number, status?: string }) => {
    const result = await dbPool.query(
        "UPDATE tables SET number = $1, capacity = $2, status = COALESCE($3, status) WHERE id = $4 RETURNING *",
        [data.number, data.capacity, data.status, id]
    );
    return result.rows[0];
};

export const deleteTable = async (id: number | string) => {
    const result = await dbPool.query("DELETE FROM tables WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};
