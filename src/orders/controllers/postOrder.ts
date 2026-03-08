import { type Request, type Response } from 'express';
import { createOrder } from '../services/createOrder.js';

export const postOrder = async (req: Request, res: Response) => {
    try {
        const { tableId, userId, total, paymentMethod, receivedAmount, changeAmount, items } = req.body;

        if (!tableId || !items || items.length === 0) {
            return res.status(400).json({ error: 'Faltan datos obligatorios para crear la orden' });
        }

        const order = await createOrder({
            tableId,
            userId,
            total,
            paymentMethod,
            receivedAmount,
            changeAmount,
            items
        });

        res.status(201).json(order);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Error interno al procesar el pago y actualizar stock' });
    }
};
