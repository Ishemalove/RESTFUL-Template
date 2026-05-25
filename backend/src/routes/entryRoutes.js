import { Router } from 'express';
import * as entryController from '../controllers/entryController.js';
import { authenticate, requireAttendantOrAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import { carEntryValidation, carExitValidation } from '../validators/entryValidators.js';

const router = Router();

router.use(authenticate, requireAttendantOrAdmin);

/**
 * @swagger
 * /api/entries:
 *   post:
 *     summary: Register car entry and generate ticket
 *     tags: [Car Entry]
 */
router.post('/', carEntryValidation, validate, entryController.carEntry);

/**
 * @swagger
 * /api/entries/exit:
 *   post:
 *     summary: Process car exit and generate bill
 *     tags: [Car Entry]
 */
router.post('/exit', carExitValidation, validate, entryController.carExit);

router.get('/active', entryController.listActiveEntries);
router.get('/:id', entryController.getEntryById);

export default router;
