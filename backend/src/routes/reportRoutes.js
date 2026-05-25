import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

/**
 * @swagger
 * /api/reports/outgoing:
 *   get:
 *     summary: Outgoing cars report between two datetimes
 *     tags: [Reports]
 */
router.get('/outgoing', reportController.outgoingReport);

/**
 * @swagger
 * /api/reports/entered:
 *   get:
 *     summary: Entered cars report between two datetimes
 *     tags: [Reports]
 */
router.get('/entered', reportController.enteredReport);

router.get('/occupancy', reportController.carsCountByLocation);

export default router;
