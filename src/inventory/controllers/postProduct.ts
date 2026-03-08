import { type Request, type Response } from 'express';
import { createProduct } from '../services/createProduct.js';

export const postProduct = async (req: Request, res: Response) => {
    try {
        const { name, price, cost_price, category, stock, image } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Falta nombre, precio o categoría' });
        }
        const newProduct = await createProduct(
            name,
            Number(price),
            category,
            Number(stock || 0),
            image || '',
            Number(cost_price || 0)
        );
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
