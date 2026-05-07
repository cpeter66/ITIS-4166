import * as categoryRepo from '../repositories/categoryRepo.js';

export async function getAllCategories() {
  return categoryRepo.getAllCategories();
}

export async function getCategoryById(id) {
  const category = await categoryRepo.getCategoryById(id);
  if (category) return category;
  const error = new Error(`Category ${id} not found`);
  error.status = 404;
  throw error;
}

export async function createCategory(categoryData) {
  return categoryRepo.createCategory(categoryData);
}

export async function updateCategory(id, updatedData) {
  const updatedCategory = await categoryRepo.updateCategory(id, updatedData);
  if (updatedCategory) return updatedCategory;
  const error = new Error(`Category ${id} not found`);
  error.status = 404;
  throw error;
}

export async function deleteCategory(id) {
  const result = await categoryRepo.deleteCategory(id);
  if (result) return;
  const error = new Error(`Category ${id} not found`);
  error.status = 404;
  throw error;
}