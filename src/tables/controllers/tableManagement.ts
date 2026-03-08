import { type Request, type Response } from 'express';
import { updateTable, deleteTable } from '../services/tableManagement.js';

export const putTable = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { number, capacity, status } = req.body;
        const table = await updateTable(id, { number, capacity: Number(capacity), status });
        if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });
        res.json(table);
    } catch (err) {
        console.error('Error updating table:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const removeTable = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const deleted = await deleteTable(id);
        if (!deleted) return res.status(404).json({ error: 'Mesa no encontrada' });
        res.json({ message: 'Mesa eliminada correctamente', table: deleted });
    } catch (err) {
        console.error('Error deleting table:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
