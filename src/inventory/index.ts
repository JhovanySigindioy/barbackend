import { Router } from 'express';
import { getProducts } from './controllers/getProducts.js';
import { postProduct } from './controllers/postProduct.js';
import { putProduct } from './controllers/putProduct.js';
import { removeProduct } from './controllers/deleteProduct.js';

const router = Router();

router.get('/', getProducts);
router.post('/', postProduct);
router.put('/:id', putProduct);
router.delete('/:id', removeProduct);

export default router;
