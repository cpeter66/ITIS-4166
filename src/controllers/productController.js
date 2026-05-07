import {
  getAllProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
} from '../services/productService.js';

export async function getAllProductsHandler(req, res) {
  const {
    search = '',
    categoryId,
    minPrice,
    maxPrice,
    sortBy = 'id',
    order = 'asc',
    offset = 0,
    limit = 20,
  } = req.query;

  const options = {
    search,
    categoryId: categoryId ? parseInt(categoryId) : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    sortBy,
    order,
    offset: parseInt(offset),
    limit: parseInt(limit),
  };
  
  const products = await getAllProductsService(options);
  res.status(200).json(products);
}

export async function getProductByIdHandler(req, res) {
  const id = parseInt(req.params.id);
  const product = await getProductByIdService(id);
  res.status(200).json(product);
}

export async function createProductHandler(req, res) {
  const { name, description, price, categoryId, stock } = req.body;
  const newProduct = await createProductService({ 
    name, 
    description, 
    price, 
    categoryId, 
    stock: stock || 0 
  });
  res.status(201).json(newProduct);
}

export async function updateProductHandler(req, res) {
  const id = parseInt(req.params.id);
  const { name, description, price, categoryId, stock } = req.body;
  
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = price;
  if (categoryId !== undefined) updateData.categoryId = categoryId;
  if (stock !== undefined) updateData.stock = stock;
  
  const updatedProduct = await updateProductService(id, updateData);
  res.status(200).json(updatedProduct);
}

export async function deleteProductHandler(req, res) {
  const id = parseInt(req.params.id);
  await deleteProductService(id);
  res.status(204).send();
}