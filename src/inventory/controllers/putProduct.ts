import { type Request, type Response } from 'express';
import { updateProduct } from '../services/updateProduct.js';

export const putProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, price, cost_price, category, stock, image } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Falta nombre, precio o categoría' });
        }
        const product = await updateProduct(id, {
            name,
            price: Number(price),
            cost_price: Number(cost_price || 0),
            category,
            stock: Number(stock || 0),
            image
        });
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
