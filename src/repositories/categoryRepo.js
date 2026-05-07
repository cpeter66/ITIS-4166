import prisma from '../config/db.js';

export async function getAllCategories() {
  return prisma.category.findMany({
    include: { 
      products: true 
    },
    orderBy: { name: 'asc' }
  });
}

export async function getCategoryById(id) {
  return prisma.category.findUnique({ 
    where: { id },
    include: { 
      products: true 
    }
  });
}

export async function createCategory(categoryData) {
  try {
    return await prisma.category.create({ 
      data: categoryData,
      include: { products: true }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const err = new Error('Category name already exists');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

export async function updateCategory(id, updatedData) {
  try {
    return await prisma.category.update({
      where: { id },
      data: updatedData,
      include: { products: true }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const err = new Error('Category name already exists');
      err.status = 409;
      throw err;
    }
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteCategory(id) {
  try {
    return await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') return null;
    if (error.code === 'P2003') {
      const err = new Error('Cannot delete category with existing products');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

export async function getCategoryByName(name) {
  return prisma.category.findUnique({ 
    where: { name },
    include: { products: true }
  });
}

export async function getCategoryWithProductCount(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        select: { id: true }
      }
    }
  });
  
  if (category) {
    return {
      ...category,
      productCount: category.products.length
    };
  }
  return null;
}