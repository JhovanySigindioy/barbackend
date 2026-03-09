import { dbPool } from '../../config/database.js';

export const getSalesReport = async (period: 'day' | 'week' | 'month' | 'total') => {
  let interval = '';
  switch (period) {
    case 'day': interval = "INTERVAL '1 day'"; break;
    case 'week': interval = "INTERVAL '1 week'"; break;
    case 'month': interval = "INTERVAL '1 month'"; break;
    default: interval = "INTERVAL '100 years'"; // Basically all time
  }

  const query = `
    SELECT 
      COALESCE(SUM(total), 0) as total_revenue,
      COUNT(id) as total_orders,
      COALESCE(AVG(total), 0) as average_ticket,
      (SELECT COALESCE(SUM(oi.quantity * oi.cost_at_time), 0) 
       FROM order_items oi 
       JOIN orders o2 ON oi.order_id = o2.id 
       WHERE o2.status = 'closed' 
       ${period !== 'total' ? `AND o2.created_at >= NOW() - ${interval}` : ''}
      ) as total_cost,
      (SELECT COALESCE(SUM(amount), 0) 
       FROM expenses 
       WHERE ${period === 'day' ? "date = CURRENT_DATE" :
      period === 'week' ? "date >= CURRENT_DATE - INTERVAL '1 week'" :
        period === 'month' ? "date >= CURRENT_DATE - INTERVAL '1 month'" : "1=1"}
      ) as total_expenses
    FROM orders
    WHERE status = 'closed'
    ${period !== 'total' ? `AND created_at >= NOW() - ${interval}` : ''}
  `;

  const paymentsQuery = `
    SELECT 
      payment_method,
      COUNT(id) as count,
      SUM(total) as amount
    FROM orders
    WHERE status = 'closed'
    ${period !== 'total' ? `AND created_at >= NOW() - ${interval}` : ''}
    GROUP BY payment_method
  `;

  const topProductsQuery = `
    SELECT 
      p.name,
      SUM(oi.quantity) as total_quantity,
      SUM(oi.quantity * oi.price_at_time) as total_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'closed'
    ${period !== 'total' ? `AND o.created_at >= NOW() - ${interval}` : ''}
    GROUP BY p.name
    ORDER BY total_quantity DESC
    LIMIT 10
  `;

  const monthlyTrendQuery = `
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM') as month,
      SUM(total) as revenue,
      COUNT(id) as orders
    FROM orders
    WHERE status = 'closed'
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `;

  const stats = await dbPool.query(query);
  const payments = await dbPool.query(paymentsQuery);
  const topProducts = await dbPool.query(topProductsQuery);
  const monthlyTrend = await dbPool.query(monthlyTrendQuery);

  return {
    summary: stats.rows[0],
    payments: payments.rows,
    topProducts: topProducts.rows,
    monthlyTrend: monthlyTrend.rows,
  };
};
