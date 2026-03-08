import { dbPool } from "../../config/database.js";

export const getAllProducts = async () => {
    const result = await dbPool.query("SELECT * FROM products ORDER BY category, name ASC");
    return result.rows;
};
