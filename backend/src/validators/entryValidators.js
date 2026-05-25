import { body } from 'express-validator';

export const carEntryValidation = [
  body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
  body('parkingCode').trim().notEmpty().withMessage('Parking code is required'),
  body('entryDateTime').optional().isISO8601().withMessage('Invalid entry date time'),
];

export const carExitValidation = [
  body('entryId').notEmpty().withMessage('Entry ID is required'),
  body('exitDateTime').optional().isISO8601().withMessage('Invalid exit date time'),
];
