import { type Request, type Response } from 'express';
import { getAllTables } from '../services/getAllTables.js';

export const getTables = async (req: Request, res: Response) => {
    try {
        const tables = await getAllTables();
        res.json(tables);
    } catch (err) {
        console.error('Error fetching tables:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
