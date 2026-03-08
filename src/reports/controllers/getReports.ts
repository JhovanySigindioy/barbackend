import { type Request, type Response } from 'express';
import { getSalesReport } from '../services/getSalesReport.js';

export const getReports = async (req: Request, res: Response) => {
    try {
        const period = (req.query.period as any) || 'total';
        const report = await getSalesReport(period);
        res.json(report);
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
