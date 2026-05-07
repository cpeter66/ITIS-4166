import { param, body } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';
import prisma from '../config/db.js';

export const validateOrderId = [
  param('id')
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage('Id must be a positive integer'),
  handleValidationErrors,
];

export const validateCreateOrder = [
  body('items')
    .exists({ values: 'falsy' })
    .withMessage('Items are required')
    .bail()
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.productId')
    .exists()
    .withMessage('Each item must have a productId')
    .bail()
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .bail()
    .custom(async (productId) => {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error(`Product ${productId} does not exist`);
      return true;
    }),
  
  body('items.*.quantity')
    .exists()
    .withMessage('Each item must have a quantity')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
    .bail()
    .custom(async (quantity, { req }) => {
      const itemIndex = req.body.items.findIndex(i => i.quantity === quantity);
      const productId = req.body.items[itemIndex]?.productId;
      
      if (productId) {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (product && product.stock < quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}`);
        }
      }
      return true;
    }),
  
  handleValidationErrors,
];

export const validateUpdateOrder = [
  param('id')
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage('Id must be a positive integer'),
  
  body('status')
    .exists({ values: 'falsy' })
    .withMessage('Status is required')
    .bail()
    .isIn(['PENDING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be one of: PENDING, COMPLETED, CANCELLED'),
  
  handleValidationErrors,
];