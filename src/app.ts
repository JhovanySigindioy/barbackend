import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/database.js';
import tableRouter from './tables/index.js';
import inventoryRouter from './inventory/index.js';
import authRouter from './auth/index.js';
import reportsRouter from './reports/index.js';
import ordersRouter from './orders/index.js';
import expensesRouter from './expenses/index.js';
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Initialize Database automatically
const setupDb = async () => {
    await initDatabase();
};

setupDb();

app.get('/', (req, res) => {
    res.send('Elite Bar POS API - Active');
});

// Use feature routers
app.use('/api/tables', tableRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/expenses', expensesRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});