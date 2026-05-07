import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService.js';

export async function getAllCategoriesHandler(req, res) {
  const categories = await getAllCategories();
  res.status(200).json(categories);
}

export async function getCategoryByIdHandler(req, res) {
  const id = parseInt(req.params.id);
  const category = await getCategoryById(id);
  res.status(200).json(category);
}

export async function createCategoryHandler(req, res) {
  const { name } = req.body;
  const newCategory = await createCategory({ name });
  res.status(201).json(newCategory);
}

export async function updateCategoryHandler(req, res) {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  const updatedCategory = await updateCategory(id, { name });
  res.status(200).json(updatedCategory);
}

export async function deleteCategoryHandler(req, res) {
  const id = parseInt(req.params.id);
  await deleteCategory(id);
  res.status(204).send();
}