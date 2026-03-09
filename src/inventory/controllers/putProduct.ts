import { type Request, type Response } from 'express';
import { updateProduct } from '../services/updateProduct.js';

export const putProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        // cost_price and stock are EXCLUDED from updates to preserve financial/audit integrity.
        // These can only be changed via the '/restock' endpoint.
        const { name, price, category, image } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Falta nombre, precio o categoría' });
        }

        const product = await updateProduct(id, {
            name,
            price: Number(price),
            category,
            image
        });

        res.json(product);
    } catch (err: any) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
};
