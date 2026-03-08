import { Router } from 'express';
import { getReports } from './controllers/getReports.js';
import { getComparison } from './controllers/getComparison.js';

const router = Router();

router.get('/', getReports);
router.get('/comparison', getComparison);

export default router;
