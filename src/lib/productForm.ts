import type { Product } from '../types/catalog';

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  category_id: string;
  image_url: string;
  sku: string;
  stock: string;
}

export const emptyProductForm = (categoryId = ''): ProductFormValues => ({
  name: '', description: '', price: '', category_id: categoryId, image_url: '', sku: '', stock: '0',
});

export function formFromProduct(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? '',
    price: product.price.toString(),
    category_id: String(product.category_id),
    image_url: product.image_url ?? '',
    sku: product.sku ?? '',
    stock: String(product.stock ?? 0),
  };
}
