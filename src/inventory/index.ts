import { Router } from 'express';
import { getProducts } from './controllers/getProducts.js';
import { postProduct } from './controllers/postProduct.js';
import { putProduct } from './controllers/putProduct.js';
import { removeProduct } from './controllers/deleteProduct.js';
import { postRestock } from './controllers/postRestock.js';
import { getInventoryMovements } from './controllers/getMovements.js';
import { deleteMovement } from './controllers/deleteMovement.js';

const router = Router();

router.get('/', getProducts);
router.get('/movements', getInventoryMovements);
router.post('/', postProduct);
router.post('/restock', postRestock);
router.put('/:id', putProduct);
router.delete('/:id', removeProduct);
router.delete('/movements/:id', deleteMovement);

export default router;
