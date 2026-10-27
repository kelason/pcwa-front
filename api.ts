/// <reference types="vite/client" />
import { authHeaders } from './src/lib/authToken';
import { throwIfNotOk } from './src/lib/apiError';
import type { Category, Product, ProductInput } from './src/types/catalog';

export type { Category, Product, ProductInput };

const getApiBaseUrl = (() => {
  let baseUrl: string | undefined;
  return () => {
    if (!baseUrl) {
      baseUrl = (import.meta.env.VITE_BACKEND_API_BASE_URL as string) || 'http://127.0.0.1:8000';
    }
    return baseUrl;
  };
})();

export { getApiBaseUrl };

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${getApiBaseUrl()}/categories/`);
  await throwIfNotOk(response, 'Failed to fetch categories');
  return response.json() as Promise<Category[]>;
}

export const categoryApi = {
  post: async (name: string): Promise<Category> => {
    const response = await fetch(`${getApiBaseUrl()}/categories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name }),
    });
    await throwIfNotOk(response, 'Failed to create category');
    return response.json() as Promise<Category>;
  },
  put: async (categoryId: string, name: string): Promise<Category> => {
    const response = await fetch(`${getApiBaseUrl()}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name }),
    });
    await throwIfNotOk(response, 'Failed to update category');
    return response.json() as Promise<Category>;
  },
  delete: async (categoryId: string): Promise<void> => {
    const response = await fetch(`${getApiBaseUrl()}/categories/${categoryId}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    await throwIfNotOk(response, 'Failed to delete category');
  },
};

export const productApi = {
  get: async (productId: string): Promise<Product> => {
    const response = await fetch(`${getApiBaseUrl()}/products/${productId}/`);
    await throwIfNotOk(response, `Failed to get product ${productId}`);
    return response.json() as Promise<Product>;
  },

  post: async (data: ProductInput): Promise<Product> => {
    const response = await fetch(`${getApiBaseUrl()}/products/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    await throwIfNotOk(response, 'Failed to create product');
    return response.json() as Promise<Product>;
  },

  put: async (productId: string, data: Partial<ProductInput>): Promise<Product> => {
    const response = await fetch(`${getApiBaseUrl()}/products/${productId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    await throwIfNotOk(response, 'Failed to update product');
    return response.json() as Promise<Product>;
  },

  delete: async (productId: string): Promise<{ message: string }> => {
    const response = await fetch(`${getApiBaseUrl()}/products/${productId}/`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    await throwIfNotOk(response, 'Failed to delete product');
    return { message: 'Product deleted successfully' };
  },
};
