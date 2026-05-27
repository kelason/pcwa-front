import { getCategories, type Category } from '../../../api';

export const CategoryServices = {
  /**
   * Fetches all product categories.
   * @returns A promise that resolves to an array of categories.
   */
  fetchAllCategories: async (): Promise<Category[]> => {
    return await getCategories();
  },

  // Add other category-related API calls here if needed
};