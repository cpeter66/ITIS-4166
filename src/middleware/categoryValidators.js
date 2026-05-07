import { param, body } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';
import prisma from '../config/db.js';

export const validateCategoryId = [
  param('id')
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage('Id must be a positive integer'),
  handleValidationErrors,
];

export const validateCreateCategory = [
  body('name')
    .trim()
    .custom(async (name) => {
      if (!name) return true;
      const category = await prisma.category.findUnique({ where: { name } });
      if (category) {
        throw new Error('Category name already exists');
      }
      return true;
    })
    .withMessage('Category name already exists'),
  
  body('name')
    .exists({ values: 'falsy' })
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  
  handleValidationErrors,
];

export const validateUpdateCategory = [
  param('id')
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage('Id must be a positive integer'),
  
  body('name')
    .trim()
    .custom(async (name, { req }) => {
      if (!name) return true;
      const category = await prisma.category.findUnique({ where: { name } });
      if (category && category.id !== parseInt(req.params.id)) {
        throw new Error('Category name already exists');
      }
      return true;
    })
    .withMessage('Category name already exists'),
  
  body('name')
    .exists({ values: 'falsy' })
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  
  handleValidationErrors,
];