import type { Request, Response } from 'express';
import { getMovements } from '../services/getMovements.js';

export const getInventoryMovements = async (req: Request, res: Response) => {
    try {
        const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
        const movements = await getMovements(productId);
        res.json(movements);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
