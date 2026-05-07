import prisma from '../config/db.js';

export async function getAllProducts({ search, categoryId, minPrice, maxPrice, sortBy, order, offset, limit }) {
  const where = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (categoryId) {
    where.categoryId = parseInt(categoryId);
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
    if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
  }
  
  const products = await prisma.product.findMany({
    where,
    include: { 
      category: true 
    },
    orderBy: { [sortBy]: order },
    take: limit,
    skip: offset,
  });
  
  return products;
}

export async function getProductById(id) {
  return prisma.product.findUnique({ 
    where: { id },
    include: { category: true }
  });
}

export async function createProduct(productData) {
  return prisma.product.create({ 
    data: productData,
    include: { category: true }
  });
}

export async function updateProduct(id, updatedData) {
  try {
    return await prisma.product.update({
      where: { id },
      data: updatedData,
      include: { category: true }
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    return await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') return null;
    
    if (error.code === 'P2003') {
      const prismaError = new Error('Cannot delete product because it has existing orders');
      prismaError.status = 409;
      throw prismaError;
    }
    
    throw error;
  }
}

export async function updateProductStock(id, quantityChange) {
  return prisma.product.update({
    where: { id },
    data: { stock: { decrement: quantityChange } }
  });
}

export async function getProductsByCategory(categoryId) {
  return prisma.product.findMany({
    where: { categoryId },
    include: { category: true }
  });
}

export async function getLowStockProducts(threshold = 5) {
  return prisma.product.findMany({
    where: { stock: { lte: threshold } },
    include: { category: true }
  });
}