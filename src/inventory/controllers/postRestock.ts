import type { Request, Response } from 'express';
import { restockProduct } from '../services/restockProduct.js';

export const postRestock = async (req: Request, res: Response) => {
    const { productId, quantity, unitCost, reason } = req.body;

    if (!productId || !quantity || !unitCost) {
        return res.status(400).json({ error: 'Faltan datos requeridos (productId, quantity, unitCost)' });
    }

    try {
        const result = await restockProduct({ productId, quantity, unitCost, reason });
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
