/// <reference types="vite/client" />

export interface Category {
  id: string | number;
  name: string;
}

export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  category_id: string | number;
}

const getApiBaseUrl = (() => {
  let baseUrl: string | undefined;
  return () => {
    if (!baseUrl) {
      baseUrl = (import.meta.env.BACKEND_API_BASE_URL as string) || 
                "http://127.0.0.1:8000";
    }
    return baseUrl;
  };
})();

/**
 * Fetches all categories.
 */
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${getApiBaseUrl()}/categories/`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json() as Promise<Category[]>;
}

/**
 * Fetches a specific category by ID.
 */
export async function getCategory(categoryId: string | number): Promise<Category> {
  const response = await fetch(`${getApiBaseUrl()}/categories/${categoryId}/`);
  if (!response.ok) throw new Error(`Failed to fetch category ${categoryId}`);
  return response.json() as Promise<Category>;
}

/**
 * Fetches all products.
 */
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${getApiBaseUrl()}/products/`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json() as Promise<Product[]>;
}

/**
 * Operations for a specific product ID.
 */
export const productApi = {
  get: async (productId: string | number): Promise<Product> => {
    const response = await fetch(`${getApiBaseUrl()}/products/${productId}/`);
    if (!response.ok) throw new Error(`Failed to get product ${productId}`);
    return response.json() as Promise<Product>;
  },

  post: async (data: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${getApiBaseUrl()}/products/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      // Try to parse the 422 error details to see what field failed
      const errorDetail = await response.json().catch(() => ({}));
      console.error('Validation Error Details:', errorDetail);
      throw new Error(`Failed to create product: ${JSON.stringify(errorDetail.detail || 'Unknown error')}`);
    }
    
    return response.json() as Promise<Product>;
  },

  put: async (productId: string | number, data: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${getApiBaseUrl()}/products/${productId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorDetail = await response.json().catch(() => ({}));
      console.error('Validation Error Details:', errorDetail);
      throw new Error(`Failed to update product: ${JSON.stringify(errorDetail.detail || 'Unknown error')}`);
    }

    return response.json() as Promise<Product>;
  },

  delete: async (productId: string | number): Promise<{ message: string }> => {
    const response = await fetch(`${getApiBaseUrl()}/products/${productId}/`, {
      method: 'DELETE',
    });

    if (response.ok) {
      if (response.status === 204) {
        // No content, return a default success message
        return { message: 'Product deleted successfully' };
      }
      // If there's content, parse it; otherwise fallback to default success message
      return response.json().catch(() => ({ message: 'Product deleted successfully' }));
    } else {
      // Use const and inline catch to resolve the linting warning and prevent SyntaxErrors on empty error bodies
      const errorDetail = await response.json().catch(() => ({}));
      
      if (!errorDetail || Object.keys(errorDetail).length === 0) {
        throw new Error(`Failed to delete product: Server responded with status ${response.status}`);
      }

      console.error('Validation Error Details:', errorDetail);
      throw new Error(`Failed to delete product: ${JSON.stringify(errorDetail.detail || 'Unknown error')}`);
    }
  }
};