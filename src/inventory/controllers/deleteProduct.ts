import { type Request, type Response } from 'express';
import { deleteProduct } from '../services/deleteProduct.js';

export const removeProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const deleted = await deleteProduct(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado correctamente', product: deleted });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
