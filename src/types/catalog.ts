export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  image_url: string | null;
  sku: string | null;
  stock: number;
  deleted_at?: string | null;
}

export type ProductInput = {
  name: string;
  description?: string | null;
  price: number;
  category_id: string;
  image_url?: string | null;
  sku?: string | null;
  stock?: number;
};

export interface Stats {
  total_products: number;
  total_categories: number;
  average_price: number;
  inventory_value: number;
}

export interface AuditEntry {
  id: string;
  product_id: string;
  actor: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export interface ProductFilters {
  sortBy?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
}
