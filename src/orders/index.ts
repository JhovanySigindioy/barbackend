import { Router } from 'express';
import { postOrder } from './controllers/postOrder.js';

const router = Router();

router.post('/', postOrder);

export default router;
