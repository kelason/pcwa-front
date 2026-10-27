import { getApiBaseUrl, productApi } from '../../api';
import { authHeaders } from '../lib/authToken';
import { throwIfNotOk } from '../lib/apiError';
import type { AuditEntry, Product, ProductFilters, ProductInput } from '../types/catalog';

const base = () => getApiBaseUrl();

export function buildProductsQuery(
  categoryId: string | 'All Categories',
  page: number,
  filters: ProductFilters,
): string {
  const params = new URLSearchParams();
  if (categoryId !== 'All Categories') params.append('category_id', categoryId);
  params.append('page', page.toString());
  params.append('sort_by', filters.sortBy || 'name');
  const search = filters.search?.trim();
  if (search) params.append('search', search);
  if (filters.minPrice) params.append('min_price', filters.minPrice);
  if (filters.maxPrice) params.append('max_price', filters.maxPrice);
  if (filters.inStock) params.append('in_stock', 'true');
  return params.toString();
}

async function getJson<T>(url: string, action: string): Promise<T> {
  const response = await fetch(url);
  await throwIfNotOk(response, action);
  return response.json() as Promise<T>;
}

async function postJson<T>(url: string, data: unknown, action: string): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  await throwIfNotOk(response, action);
  return response.json() as Promise<T>;
}

export const ProductServices = {
  fetchProducts: async (
    categoryId: string | 'All Categories',
    page: number,
    filters: ProductFilters = {},
  ): Promise<{ products: Product[]; total: number }> => {
    const data = await getJson<{ items: Product[]; total: number }>(
      `${base()}/products/?${buildProductsQuery(categoryId, page, filters)}`,
      'Failed to fetch products',
    );
    return { products: data.items || [], total: data.total || 0 };
  },

  deleteProduct: async (id: string): Promise<void> => { await productApi.delete(id); },
  createProduct: async (product: ProductInput): Promise<Product> => productApi.post(product),
  updateProduct: async (id: string, product: Partial<ProductInput>): Promise<Product> => productApi.put(id, product),
  saveProduct: async (product: ProductInput, id?: string): Promise<Product> =>
    id ? ProductServices.updateProduct(id, product) : ProductServices.createProduct(product),

  bulkDelete: async (ids: string[]): Promise<{ deleted: number; failed: { id: string; reason: string }[] }> =>
    postJson(`${base()}/products/bulk-delete`, { ids }, 'Bulk delete failed'),

  bulkCategorize: async (ids: string[], categoryId: string): Promise<{ updated: number; failed: { id: string; reason: string }[] }> =>
    postJson(`${base()}/products/bulk-categorize`, { ids, category_id: categoryId }, 'Bulk categorize failed'),

  fetchTrash: async (page = 1): Promise<{ products: Product[]; total: number }> => {
    const response = await fetch(`${base()}/products/trash?page=${page}`, { headers: { ...authHeaders() } });
    await throwIfNotOk(response, 'Failed to fetch trash');
    const data = (await response.json()) as { items: Product[]; total: number };
    return { products: data.items || [], total: data.total || 0 };
  },

  restoreProduct: async (id: string): Promise<Product> =>
    postJson(`${base()}/products/${id}/restore`, {}, 'Failed to restore product'),

  deletePermanently: async (id: string): Promise<void> => {
    const response = await fetch(`${base()}/products/${id}/permanent`, {
      method: 'DELETE', headers: { ...authHeaders() },
    });
    await throwIfNotOk(response, 'Failed to permanently delete product');
  },

  fetchAudit: async (id: string): Promise<AuditEntry[]> => {
    const response = await fetch(`${base()}/products/${id}/audit`, { headers: { ...authHeaders() } });
    await throwIfNotOk(response, 'Failed to fetch audit trail');
    return response.json() as Promise<AuditEntry[]>;
  },

  exportUrl: (categoryId: string | 'All Categories', search?: string): string => {
    const params = new URLSearchParams();
    if (categoryId !== 'All Categories') params.append('category_id', categoryId);
    if (search?.trim()) params.append('search', search.trim());
    const qs = params.toString();
    return `${base()}/products/export${qs ? `?${qs}` : ''}`;
  },

  importCsv: async (file: File): Promise<{ created: number; failed: { row: number; reason: string }[] }> => {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${base()}/products/import`, {
      method: 'POST', headers: { ...authHeaders() }, body: form,
    });
    await throwIfNotOk(response, 'CSV import failed');
    return response.json();
  },
};
