import prisma from '../config/db.js';

export async function createUser(data) {
  try {
    const newUser = await prisma.user.create({
      data,
      omit: { password: true },
    });
    return newUser;
  } catch (error) {
    if (error.code === 'P2002') {
      const err = new Error('Email has already been used');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

export async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id) {
  return prisma.user.findUnique({ 
    where: { id },
    omit: { password: true }
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    omit: { password: true },
    include: {
      orders: true
    }
  });
}

export async function updateUser(id, data) {
  try {
    return await prisma.user.update({
      where: { id },
      data,
      omit: { password: true }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error(`User ${id} not found`);
      err.status = 404;
      throw err;
    }
    throw error;
  }
}

export async function deleteUser(id) {
  try {
    return await prisma.user.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error(`User ${id} not found`);
      err.status = 404;
      throw err;
    }
    throw error;
  }
}