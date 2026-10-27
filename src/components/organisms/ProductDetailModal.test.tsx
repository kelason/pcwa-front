import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Product } from '../../types/catalog';
import { ProductDetailModal } from './ProductDetailModal';

const product: Product = {
  id: 'p1', name: 'Wireless Mouse', description: null, price: 25.99,
  category_id: 'c1', image_url: null, sku: null, stock: 0,
};

describe('ProductDetailModal', () => {
  it('renders name, price and category with null optional fields', () => {
    render(<ProductDetailModal product={product} categoryName="Electronics" canWrite onClose={() => undefined} onEdit={() => undefined} />);
    expect(screen.getByText('Wireless Mouse')).toBeTruthy();
    expect(screen.getByText('$25.99')).toBeTruthy();
    expect(screen.getByText('Electronics')).toBeTruthy();
    expect(screen.getByText('No description.')).toBeTruthy();
    expect(screen.getByText('No image')).toBeTruthy();
  });

  it('fires onEdit once when Edit is clicked', () => {
    const onEdit = vi.fn();
    render(<ProductDetailModal product={product} categoryName="Electronics" canWrite onClose={() => undefined} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(product);
  });
});
