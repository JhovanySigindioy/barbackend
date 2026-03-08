import { dbPool } from '../../config/database.js';

export const validateUser = async (username: string, password: string) => {
    const result = await dbPool.query(
        "SELECT id, name, username, role FROM users WHERE username = $1 AND password = $2",
        [username, password]
    );
    return result.rows[0];
};
