import { productApi, type Product } from '../../../api';

const getBaseUrl = () => (import.meta.env as Record<string, string | undefined>).VITE_BACKEND_API_BASE_URL || 'http://127.0.0.1:8000';

export const ProductServices = {
  /**
   * Fetches products, optionally filtered by category.
   * @param categoryId The ID of the category to filter by, or 'All Categories' to fetch all products.
   * @param page The current page number for pagination.
   * @param sortBy Optional field name to sort the results by.
   * @returns A promise that resolves to an array of products.
   */
  fetchProducts: async (categoryId: string | 'All Categories', page: number, sortBy?: string): Promise<{ products: Product[], total: number }> => {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams();

    // Match Python: category_id is an optional Query parameter
    if (categoryId !== 'All Categories') {
      params.append('category_id', categoryId);
    }
    
    // Match Python: page is a Query parameter
    params.append('page', page.toString());

    // Match Python: sort_by is an optional Query parameter
    if (sortBy) {
      params.append('sort_by', sortBy);
    }

    const url = `${baseUrl}/products/?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      products: data.items || [],
      total: data.total || 0
    };
  },

  /**
   * Deletes a product by its ID.
   * @param id The ID of the product to delete.
   */
  deleteProduct: async (id: string): Promise<void> => {
    await productApi.delete(id);
  },

  /**
   * Creates a new product.
   * @param product The product data to create.
   * @returns A promise that resolves to the created product.
   */
  createProduct: async (product: Partial<Product>): Promise<Product> => {
    return await productApi.post(product);
  },

  /**
   * Updates an existing product.
   * @param id The ID of the product to update.
   * @param product The updated product data.
   * @returns A promise that resolves to the updated product.
   */
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    return await productApi.put(id, product);
  },

  /**
   * Saves a product by creating it if no ID is provided, or updating it if an ID is provided.
   * @param product Data for the product.
   * @param id Optional ID for updating an existing product.
   * @returns A promise that resolves to the saved product.
   */
  saveProduct: async (product: Partial<Product>, id?: string): Promise<Product> => {
    return id 
      ? ProductServices.updateProduct(id, product)
      : ProductServices.createProduct(product);
  },
};