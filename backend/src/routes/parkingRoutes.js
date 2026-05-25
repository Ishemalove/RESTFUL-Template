import { Router } from 'express';
import * as parkingController from '../controllers/parkingController.js';
import { authenticate, requireAdmin, requireAttendantOrAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import { createParkingValidation } from '../validators/parkingValidators.js';

const router = Router();

/**
 * @swagger
 * /api/parkings:
 *   post:
 *     summary: Register a parking (Admin)
 *     tags: [Parking]
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  createParkingValidation,
  validate,
  parkingController.createParking
);

/**
 * @swagger
 * /api/parkings:
 *   get:
 *     summary: List parkings with availability
 *     tags: [Parking]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authenticate, requireAttendantOrAdmin, parkingController.listParkings);

router.get('/:code', authenticate, requireAttendantOrAdmin, parkingController.getParkingByCode);

router.put('/:code', authenticate, requireAdmin, parkingController.updateParking);

export default router;
