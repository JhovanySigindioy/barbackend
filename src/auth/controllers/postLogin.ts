import { type Request, type Response } from 'express';
import { validateUser } from '../services/validateUser.js';

export const postLogin = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Falta usuario o contraseña' });
        }
        const user = await validateUser(username, password);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
