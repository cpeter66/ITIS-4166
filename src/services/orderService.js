import {
  getAllOrders as getAllOrdersRepo,
  getOrderById as getOrderByIdRepo,
  createOrder as createOrderRepo,
  updateOrder as updateOrderRepo,
  deleteOrder as deleteOrderRepo,
} from '../repositories/orderRepo.js';
import {getProductById, updateProductStock } from '../repositories/productRepo.js';

export async function getAllOrders(userId, userRole) {
  const isAdmin = userRole === 'ADMIN';
  return getAllOrdersRepo(userId, isAdmin);
}

export async function getOrderById(id, userId, userRole) {
  const order = await getOrderByIdRepo(id);
  if (!order) {
    const error = new Error(`Order ${id} not found`);
    error.status = 404;
    throw error;
  }
  
  if (userRole !== 'ADMIN' && order.userId !== userId) {
    const error = new Error('Forbidden: insufficient permission');
    error.status = 403;
    throw error;
  }
  
  return order;
}

export async function createOrder(userId, itemsData) {
  // Validate stock first
  for (const item of itemsData) {
    const product = await getProductById(item.productId);
    if (!product) {
      const error = new Error(`Product ${item.productId} not found`);
      error.status = 404;
      throw error;
    }
    if (product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for product: ${product.name}`);
      error.status = 400;
      throw error;
    }
  }
  
  // Prepare order items with current prices
  const orderItems = [];
  for (const item of itemsData) {
    const product = await getProductById(item.productId);
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    });
  }
  
  // Create order first
  const orderData = {
    userId,
    status: 'PENDING',
    items: { create: orderItems }
  };
  
  const order = await createOrderRepo(orderData);
    for (const item of itemsData) {
    await updateProductStock(item.productId, item.quantity);
  }
  
  return order;
}

export async function updateOrderStatus(id, userId, userRole, status) {
  const order = await getOrderByIdRepo(id);
  if (!order) {
    const error = new Error(`Order ${id} not found`);
    error.status = 404;
    throw error;
  }
  
  // ONLY admins can update order status
  if (userRole !== 'ADMIN') {
    const error = new Error('Forbidden: Only admins can update order status');
    error.status = 403;
    throw error;
  }
  
  const updatedOrder = await updateOrderRepo(id, { status });
  return updatedOrder;
}

export async function deleteOrder(id, userId, userRole) {
  const order = await getOrderByIdRepo(id);
  if (!order) {
    const error = new Error(`Order ${id} not found`);
    error.status = 404;
    throw error;
  }
  
  if (userRole !== 'ADMIN' && order.userId !== userId) {
    const error = new Error('Forbidden: insufficient permission');
    error.status = 403;
    throw error;
  }
  
  return deleteOrderRepo(id);
}