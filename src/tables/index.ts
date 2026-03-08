import { Router } from 'express';
import { getTables } from './controllers/getTables.js';
import { postTable } from './controllers/createTable.js';
import { getSalesByTable } from './controllers/getSalesByTable.js';
import { putTable, removeTable } from './controllers/tableManagement.js';

const router = Router();

router.get('/', getTables);
router.post('/', postTable);
router.put('/:id', putTable);
router.delete('/:id', removeTable);
router.get('/sales', getSalesByTable);

export default router;
