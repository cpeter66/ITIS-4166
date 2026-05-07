import prisma from '../config/db.js';

export async function getAllOrders(userId, isAdmin = false) {
  const where = isAdmin ? {} : { userId };
  
  return prisma.order.findMany({
    where,
    include: {
      items: {
        include: { 
          product: {
            include: { category: true }
          }
        }
      },
      user: {
        omit: { password: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getOrderById(id) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { 
          product: {
            include: { category: true }
          }
        }
      },
      user: {
        omit: { password: true }
      }
    }
  });
}

export async function createOrder(orderData) {
  return prisma.order.create({
    data: orderData,
    include: { 
      items: {
        include: { product: true }
      }
    }
  });
}

export async function updateOrder(id, updatedData) {
  try {
    return await prisma.order.update({
      where: { id },
      data: updatedData,
      include: { 
        items: {
          include: { product: true }
        }
      }
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteOrder(id) {
  try {
    return await prisma.order.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function getOrdersByStatus(status, userId = null) {
  const where = { status };
  if (userId) where.userId = userId;
  
  return prisma.order.findMany({
    where,
    include: {
      items: {
        include: { product: true }
      },
      user: {
        omit: { password: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getOrderItems(orderId) {
  return prisma.orderItem.findMany({
    where: { orderId },
    include: { product: true }
  });
}

export async function createOrderItems(orderItemsData) {
  return prisma.orderItem.createMany({
    data: orderItemsData
  });
}

export async function getOrderTotal(orderId) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { price: true, quantity: true }
  });
  
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export async function getUserOrderCount(userId) {
  return prisma.order.count({
    where: { userId }
  });
}