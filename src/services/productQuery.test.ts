import { describe, expect, it } from 'vitest';
import { buildProductsQuery } from './ProductServices';

describe('buildProductsQuery', () => {
  it('always sends page and sort_by', () => {
    const params = new URLSearchParams(buildProductsQuery('All Categories', 2, {}));
    expect(params.get('page')).toBe('2');
    expect(params.get('sort_by')).toBe('name');
  });
  it('omits category for All Categories and includes it otherwise', () => {
    expect(new URLSearchParams(buildProductsQuery('All Categories', 1, {})).has('category_id')).toBe(false);
    expect(new URLSearchParams(buildProductsQuery('cat-1', 1, {})).get('category_id')).toBe('cat-1');
  });
  it('includes trimmed search and filters only when set', () => {
    const params = new URLSearchParams(buildProductsQuery('All Categories', 1, {
      search: '  mouse ', minPrice: '10', maxPrice: '50', inStock: true, sortBy: 'price_low',
    }));
    expect(params.get('search')).toBe('mouse');
    expect(params.get('min_price')).toBe('10');
    expect(params.get('max_price')).toBe('50');
    expect(params.get('in_stock')).toBe('true');
    expect(params.get('sort_by')).toBe('price_low');
  });
  it('omits blank search', () => {
    expect(new URLSearchParams(buildProductsQuery('All Categories', 1, { search: '   ' })).has('search')).toBe(false);
  });
});
