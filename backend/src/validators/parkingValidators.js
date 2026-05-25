import { body } from 'express-validator';

export const createParkingValidation = [
  body('code').trim().notEmpty().withMessage('Parking code is required'),
  body('name').trim().notEmpty().withMessage('Parking name is required'),
  body('numberOfSpaces').isInt({ min: 1 }).withMessage('Number of spaces must be at least 1'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('feePerHour').isFloat({ min: 0 }).withMessage('Fee per hour must be a positive number'),
];
