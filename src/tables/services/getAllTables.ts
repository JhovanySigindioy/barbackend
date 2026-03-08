import { dbPool } from "../../config/database.js";

export const getAllTables = async () => {
    const result = await dbPool.query("SELECT * FROM tables ORDER BY number ASC");
    return result.rows;
};
