import { type Request, type Response } from 'express';
import { createTable } from '../services/createTable.js';

export const postTable = async (req: Request, res: Response) => {
    try {
        const { number, capacity } = req.body;
        if (!number || !capacity) {
            return res.status(400).json({ error: 'Falta campo mesa o capacidad' });
        }
        const newTable = await createTable(number, capacity);
        res.status(201).json(newTable);
    } catch (err: any) {
        console.error('Error creating table:', err);
        if (err.code === '23505') { // Duplicate unique key
            return res.status(400).json({ error: 'La mesa ya existe' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
