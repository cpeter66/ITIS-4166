import express from 'express';
import {
  getAllOrdersHandler,
  getOrderByIdHandler,
  createOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
} from '../controllers/orderController.js';
import {
  validateOrderId,
  validateCreateOrder,
  validateUpdateOrder,
} from '../middleware/orderValidators.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.get('/', authenticate, getAllOrdersHandler);
router.get('/:id', authenticate, validateOrderId, getOrderByIdHandler);
router.post('/', authenticate, validateCreateOrder, createOrderHandler);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), validateUpdateOrder, updateOrderHandler);
router.delete('/:id', authenticate, validateOrderId, deleteOrderHandler);

export default router;