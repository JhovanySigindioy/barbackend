import { type Request, type Response } from 'express';
import { getComparisonReport } from '../services/getComparisonReport.js';

export const getComparison = async (req: Request, res: Response) => {
    try {
        const data = await getComparisonReport();
        res.json(data);
    } catch (err) {
        console.error('Error fetching comparison report:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
