import { type Request, type Response } from 'express';
import { getTableSalesStats } from '../services/getTableSalesStats.js';

export const getSalesByTable = async (req: Request, res: Response) => {
    try {
        const stats = await getTableSalesStats();
        res.json(stats);
    } catch (err) {
        console.error('Error fetching table sales stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
