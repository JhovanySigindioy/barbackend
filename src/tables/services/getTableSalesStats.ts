import { dbPool } from '../../config/database.js';

export const getTableSalesStats = async () => {
    const query = `
    SELECT 
      t.number as table_number,
      COUNT(o.id) as total_orders,
      SUM(o.total) as total_sales
    FROM tables t
    INNER JOIN orders o ON t.id = o.table_id
    WHERE o.status = 'closed'
    GROUP BY t.number
    ORDER BY total_sales DESC
  `;
    const result = await dbPool.query(query);
    return result.rows;
};
