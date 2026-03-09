import { type Request, type Response } from 'express';
import * as expenseService from '../services/expenseService.js';

export const getExpenses = async (req: Request, res: Response) => {
    try {
        const month = req.query.month as string;
        const expenses = await expenseService.getAllExpenses(month);
        res.json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const postExpense = async (req: Request, res: Response) => {
    try {
        const { description, amount, category, date } = req.body;
        if (!description || !amount || !category) {
            return res.status(400).json({ error: 'Falta descripción, monto o categoría' });
        }
        const newExpense = await expenseService.createExpense({
            description,
            amount: Number(amount),
            category,
            date
        });
        res.status(201).json(newExpense);
    } catch (err) {
        console.error('Error creating expense:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const removeExpense = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string) || '';
        await expenseService.deleteExpense(id);
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
