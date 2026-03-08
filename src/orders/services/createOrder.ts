import { dbPool } from '../../config/database.js';

interface OrderItem {
    productId: number | string;
    quantity: number;
    price: number;
}

interface OrderData {
    tableId: number | string;
    userId: number | string;
    total: number;
    paymentMethod: string;
    receivedAmount: number;
    changeAmount: number;
    items: OrderItem[];
}

export const createOrder = async (data: OrderData) => {
    const client = await dbPool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create the order
        const orderResult = await client.query(
            `INSERT INTO orders (table_id, user_id, total, status, payment_method, received_amount, change_amount) 
       VALUES ($1, $2, $3, 'closed', $4, $5, $6) RETURNING id`,
            [Number(data.tableId), Number(data.userId), data.total, data.paymentMethod, data.receivedAmount, data.changeAmount]
        );

        const orderId = orderResult.rows[0].id;

        // 2. Create order items and update stock
        for (const item of data.items) {
            const productId = Number(item.productId);
            const quantity = Number(item.quantity);

            // Insert item with price and cost at that moment
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_time, cost_at_time) 
                 SELECT $1, $2, $3, $4, cost_price FROM products WHERE id = $2`,
                [orderId, productId, quantity, item.price]
            );

            // Decrease stock
            await client.query(
                `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                [quantity, productId]
            );
        }

        // 3. Update table status to dirty (so it can be cleaned)
        await client.query(
            `UPDATE tables SET status = 'dirty' WHERE id = $1`,
            [Number(data.tableId)]
        );

        await client.query('COMMIT');
        return { id: orderId, ...data };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
