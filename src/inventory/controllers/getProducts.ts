import { type Request, type Response } from 'express';
import { getAllProducts } from '../services/getAllProducts.js';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
