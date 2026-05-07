import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from '../services/orderService.js';

export async function getAllOrdersHandler(req, res) {
  const orders = await getAllOrders(req.user.id, req.user.role);
  res.status(200).json(orders);
}

export async function getOrderByIdHandler(req, res) {
  const id = parseInt(req.params.id);
  const order = await getOrderById(id, req.user.id, req.user.role);
  res.status(200).json(order);
}

export async function createOrderHandler(req, res) {
  const { items } = req.body;
  const order = await createOrder(req.user.id, items);
  res.status(201).json(order);
}

export async function updateOrderHandler(req, res) {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const order = await updateOrderStatus(id, req.user.id, req.user.role, status);
  res.status(200).json(order);
}

export async function deleteOrderHandler(req, res) {
  const id = parseInt(req.params.id);
  await deleteOrder(id, req.user.id, req.user.role);
  res.status(204).send();
}