import { productApi, getProducts, type Product } from '../../../api';

const getBaseUrl = () => (import.meta.env as Record<string, string | undefined>).REACT_APP_BACKEND_API_BASE_URL || 'http://127.0.0.1:8000';

export const ProductServices = {
  /**
   * Fetches products, optionally filtered by category.
   * @param categoryId The ID of the category to filter by, or 'All Categories' to fetch all products.
   * @returns A promise that resolves to an array of products.
   */
  fetchProducts: async (categoryId: string | 'All Categories'): Promise<Product[]> => {
    if (categoryId === 'All Categories') {
      return await getProducts();
    } else {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/products/category/${categoryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }
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