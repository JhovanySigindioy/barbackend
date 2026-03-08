import { dbPool } from '../../config/database.js';

export const getAllExpenses = async () => {
    const result = await dbPool.query("SELECT * FROM expenses ORDER BY date DESC, created_at DESC");
    return result.rows;
};

export const createExpense = async (data: { description: string, amount: number, category: string, date?: string }) => {
    const result = await dbPool.query(
        "INSERT INTO expenses (description, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING *",
        [data.description, data.amount, data.category, data.date || new Date().toISOString().split('T')[0]]
    );
    return result.rows[0];
};

export const deleteExpense = async (id: number | string) => {
    await dbPool.query("DELETE FROM expenses WHERE id = $1", [id]);
    return true;
};

export const getExpensesSummary = async () => {
    const result = await dbPool.query(`
        SELECT 
            TO_CHAR(date, 'YYYY-MM') as month,
            SUM(amount) as total
        FROM expenses
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
    `);
    return result.rows;
};
