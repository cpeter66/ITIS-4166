import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../repositories/productRepo.js';

export async function getAllProductsService(options) {
  return getAllProducts(options);
}

export async function getProductByIdService(id) {
  const product = await getProductById(id);
  if (product) return product;
  const error = new Error(`Product ${id} not found`);
  error.status = 404;
  throw error;
}

export async function createProductService(productData) {
  return createProduct(productData);
}

export async function updateProductService(id, updatedData) {
  const updatedProduct = await updateProduct(id, updatedData);
  if (updatedProduct) return updatedProduct;
  const error = new Error(`Product ${id} not found`);
  error.status = 404;
  throw error;
}

export async function deleteProductService(id) {
  try {
    const result = await deleteProduct(id);
    if (result) return;
    const error = new Error(`Product ${id} not found`);
    error.status = 404;
    throw error;
  } catch (error) {
    throw error;
  }
}