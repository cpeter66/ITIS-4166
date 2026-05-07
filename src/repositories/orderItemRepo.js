import prisma from '../config/db.js';

export async function getOrderItemById(id) {
  return prisma.orderItem.findUnique({
    where: { id },
    include: {
      order: true,
      product: true
    }
  });
}

export async function getOrderItemsByOrder(orderId) {
  return prisma.orderItem.findMany({
    where: { orderId },
    include: {
      product: {
        include: { category: true }
      }
    }
  });
}

export async function createOrderItem(data) {
  return prisma.orderItem.create({
    data,
    include: { product: true }
  });
}

export async function updateOrderItem(id, data) {
  try {
    return await prisma.orderItem.update({
      where: { id },
      data,
      include: { product: true }
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteOrderItem(id) {
  try {
    return await prisma.orderItem.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteOrderItemsByOrder(orderId) {
  return prisma.orderItem.deleteMany({
    where: { orderId }
  });
}