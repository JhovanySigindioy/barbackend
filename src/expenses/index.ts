import { Router } from 'express';
import { getExpenses, postExpense, removeExpense } from './controllers/expenseController.js';

const router = Router();

router.get('/', getExpenses);
router.post('/', postExpense);
router.delete('/:id', removeExpense);

export default router;
