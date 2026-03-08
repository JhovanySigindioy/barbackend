import { Router } from 'express';
import { postLogin } from './controllers/postLogin.js';

const router = Router();

router.post('/login', postLogin);

export default router;
