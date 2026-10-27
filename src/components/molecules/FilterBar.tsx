import React from 'react';
import type { Category, ProductFilters } from '../../types/catalog';

interface FilterBarProps {
  currentFilter: string | 'All Categories';
  onFilterChange: (categoryId: string | 'All Categories') => void;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  categories: Category[];
  displayedCount: number;
  totalCount: number;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onRefresh: () => void;
}

const selectClasses = 'block w-full pt-3 pl-3 pr-10 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4E878C]/20 focus:border-[#4E878C] rounded-lg bg-white font-medium';
const labelClasses = 'text-xs text-[#4E878C] absolute -top-2 left-2 bg-white px-1 z-10 font-bold';

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter, onFilterChange, filters, onFiltersChange, categories,
  displayedCount, totalCount, viewMode, onViewModeChange, onRefresh,
}) => {
  const set = (patch: Partial<ProductFilters>) => onFiltersChange({ ...filters, ...patch });
  const rangeInvalid =
    filters.minPrice !== undefined && filters.maxPrice !== undefined &&
    filters.minPrice !== '' && filters.maxPrice !== '' &&
    Number(filters.minPrice) > Number(filters.maxPrice);

  return (
    <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col xl:flex-row xl:items-start gap-4 justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow w-full">
          <div className="relative w-full">
            <label className={labelClasses} htmlFor="filter-search">Search by name</label>
            <input
              id="filter-search" type="search" value={filters.search ?? ''}
              onChange={(e) => set({ search: e.target.value })}
              placeholder="Type to search…"
              className={selectClasses}
            />
          </div>
          <div className="relative w-full">
            <label className={labelClasses} htmlFor="filter-category">Filter by Category</label>
            <select id="filter-category" value={currentFilter} onChange={(e) => onFilterChange(e.target.value)} className={selectClasses}>
              <option value="All Categories">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="relative w-full">
            <label className={labelClasses} htmlFor="filter-sort">Sort By</label>
            <select id="filter-sort" value={filters.sortBy || 'name'} onChange={(e) => set({ sortBy: e.target.value })} className={selectClasses}>
              <option value="name">Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
          <div className="relative w-full">
            <label className={labelClasses} htmlFor="filter-min">Min price ($)</label>
            <input id="filter-min" type="number" min="0" step="0.01" value={filters.minPrice ?? ''}
              onChange={(e) => set({ minPrice: e.target.value })} className={selectClasses} />
          </div>
          <div className="relative w-full">
            <label className={labelClasses} htmlFor="filter-max">Max price ($)</label>
            <input id="filter-max" type="number" min="0" step="0.01" value={filters.maxPrice ?? ''}
              onChange={(e) => set({ maxPrice: e.target.value })} className={selectClasses} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 pt-3">
            <input type="checkbox" checked={Boolean(filters.inStock)}
              onChange={(e) => set({ inStock: e.target.checked })} className="accent-[#4E878C]" />
            In stock only
          </label>
        </div>

        <div className="flex flex-col items-stretch gap-3 shrink-0">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden" role="group" aria-label="View mode">
            <button type="button" onClick={() => onViewModeChange('grid')}
              className={`px-3 py-2 text-sm font-semibold ${viewMode === 'grid' ? 'bg-[#00241B] text-white' : 'bg-white text-slate-500'}`}>
              Grid
            </button>
            <button type="button" onClick={() => onViewModeChange('table')}
              className={`px-3 py-2 text-sm font-semibold ${viewMode === 'table' ? 'bg-[#00241B] text-white' : 'bg-white text-slate-500'}`}>
              Table
            </button>
          </div>
          <button type="button" onClick={onRefresh}
            className="px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
            Refresh
          </button>
          <p className="text-slate-500 text-sm font-medium whitespace-nowrap">
            Showing {displayedCount} of {totalCount} products
          </p>
        </div>
      </div>
      {rangeInvalid && <p className="text-red-500 text-xs mt-3 text-left">Min price cannot be greater than max price.</p>}
    </div>
  );
};
