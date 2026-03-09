import type { Request, Response } from 'express';
import { voidMovement } from '../services/voidMovement.js';

export const deleteMovement = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const result = await voidMovement(id);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
