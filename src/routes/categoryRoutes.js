import express from 'express';
import {
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/categoryController.js';
import {
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
} from '../middleware/categoryValidators.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.get('/', getAllCategoriesHandler);
router.get('/:id', validateCategoryId, getCategoryByIdHandler);

router.post('/', authenticate, authorizeRoles('ADMIN'), validateCreateCategory, createCategoryHandler);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), validateUpdateCategory, updateCategoryHandler);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), validateCategoryId, deleteCategoryHandler);

export default router;