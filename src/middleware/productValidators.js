import { param, body, query } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';
import prisma from '../config/db.js';
export const validateId = [
  param('id')
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage('Id must be a positive integer'),
  handleValidationErrors,
];
export const validateCreateProduct = [
  body('name')
    .exists({ values: 'falsy' })
    .withMessage('Name is required')
    .bail()
    .trim()
    .escape()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters')
    .bail()
    .custom(async (name) => {
      const product = await prisma.product.findUnique({ where: { name } });
      if (product) throw new Error('Product name already exists');
      return true;
    }),
  
  body('price')
    .exists({ values: 'falsy' })
    .withMessage('Price is required')
    .bail()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('categoryId')
    .exists({ values: 'falsy' })
    .withMessage('Category ID is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
    .bail()
    .custom(async (id) => {
      const category = await prisma.category.findUnique({ where: { id } });
      if (!category) throw new Error('Category does not exist');
      return true;
    }),
  
  body('description')
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage('Description must be a string'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  handleValidationErrors,
];
export const validateUpdateProduct = [
  param('id')
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage('Id must be a positive integer'),
  
  body('name')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters')
    .bail()
    .custom(async (name, { req }) => {
      if (name) {
        const product = await prisma.product.findUnique({ where: { name } });
        if (product && product.id !== parseInt(req.params.id)) {
          throw new Error('Product name already exists');
        }
      }
      return true;
    }),
  
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
    .bail()
    .custom(async (id) => {
      if (id) {
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) throw new Error('Category does not exist');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage('Description must be a string'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  handleValidationErrors,
];
export const validateProductQuery = [
  query('sortBy')
    .optional()
    .isIn(['id', 'name', 'price', 'stock', 'createdAt'])
    .withMessage('sortBy must be one of: id, name, price, stock, createdAt'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be either asc or desc'),
  
  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('categoryId must be a positive integer'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a non-negative number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a non-negative number'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('offset must be a non-negative integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  
  handleValidationErrors,
];