import { handleValidationErrors } from './handleValidationErrors.js';
import { body } from 'express-validator';
import prisma from '../config/db.js';

export const validateSignUp = [
  body('email')
    .trim()
    .normalizeEmail()
    .custom(async (email) => {
      if (!email) return true;
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        throw new Error('Email already exists');
      }
      return true;
    })
    .withMessage('Email already exists'),
  
  body('email')
    .exists({ values: 'falsy' })
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email is not valid'),

  body('password')
    .exists({ values: 'falsy' })
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must contain at least 8 characters and at most 64 characters'),

  body('role')
    .optional()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role must be either USER or ADMIN'),

  handleValidationErrors,
];

export const validateLogIn = [
  body('email')
    .trim()
    .exists({ values: 'falsy' })
    .withMessage('Email is required')
    .bail()
    .normalizeEmail(),

  body('password')
    .exists({ values: 'falsy' })
    .withMessage('Password is required'),

  handleValidationErrors,
];