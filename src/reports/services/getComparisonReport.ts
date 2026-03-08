import { dbPool } from '../../config/database.js';

export const getComparisonReport = async () => {
    // 1. Comparativa Mensual (Mes Actual vs Mes Anterior)
    const monthlyQuery = `
    SELECT 
      TO_CHAR(created_at, 'MM') as month_num,
      TO_CHAR(created_at, 'Month') as period,
      SUM(total) as revenue,
      COUNT(id) as orders
    FROM orders
    WHERE status = 'closed'
    AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    GROUP BY month_num, period
    ORDER BY month_num DESC
  `;

    // 2. Comparativa Semanal (Semana Actual vs Semana Anterior)
    const weeklyQuery = `
    SELECT 
      TO_CHAR(created_at, 'IW') as week_num,
      'Semana ' || TO_CHAR(created_at, 'IW') as period,
      SUM(total) as revenue,
      COUNT(id) as orders
    FROM orders
    WHERE status = 'closed'
    AND created_at >= DATE_TRUNC('week', NOW() - INTERVAL '1 week')
    GROUP BY week_num, period
    ORDER BY week_num DESC
  `;

    // 3. Comparativa por Categoría (Mes Actual vs Mes Anterior)
    const categoryQuery = `
    WITH current_month AS (
      SELECT p.category, SUM(oi.quantity * oi.price_at_time) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'closed' 
      AND o.created_at >= DATE_TRUNC('month', NOW())
      GROUP BY p.category
    ),
    prev_month AS (
      SELECT p.category, SUM(oi.quantity * oi.price_at_time) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'closed' 
      AND o.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
      AND o.created_at < DATE_TRUNC('month', NOW())
      GROUP BY p.category
    )
    SELECT 
      COALESCE(c.category, p.category) as category,
      COALESCE(c.revenue, 0) as current_revenue,
      COALESCE(p.revenue, 0) as prev_revenue
    FROM current_month c
    FULL OUTER JOIN prev_month p ON c.category = p.category
    ORDER BY current_revenue DESC
  `;

    const monthly = await dbPool.query(monthlyQuery);
    const weekly = await dbPool.query(weeklyQuery);
    const categories = await dbPool.query(categoryQuery);

    return {
        monthly: monthly.rows,
        weekly: weekly.rows,
        categories: categories.rows
    };
};
