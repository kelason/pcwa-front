import { categoryApi, getCategories } from '../../api';
import type { Category } from '../types/catalog';

export const CategoryServices = {
  fetchAllCategories: async (): Promise<Category[]> => getCategories(),
  createCategory: async (name: string): Promise<Category> => categoryApi.post(name),
  updateCategory: async (id: string, name: string): Promise<Category> => categoryApi.put(id, name),
  deleteCategory: async (id: string): Promise<void> => categoryApi.delete(id),
};
