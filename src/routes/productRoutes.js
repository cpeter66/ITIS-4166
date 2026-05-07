import express from 'express';
import {
  getAllProductsHandler,
  getProductByIdHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from '../controllers/productController.js';
import {
  validateId,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery,
} from '../middleware/productValidators.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.get('/', validateProductQuery, getAllProductsHandler);
router.get('/:id', validateId, getProductByIdHandler);

router.post('/', authenticate, authorizeRoles('ADMIN'), validateCreateProduct, createProductHandler);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), validateId, validateUpdateProduct, updateProductHandler);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), validateId, deleteProductHandler);

export default router;