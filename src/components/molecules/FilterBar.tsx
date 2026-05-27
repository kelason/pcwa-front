import React from 'react';
import { type Category } from '../../../api';

interface FilterBarProps {
  currentFilter: string | 'All Categories';
  onFilterChange: (categoryId: string | 'All Categories') => void;
  categories: Category[];
  displayedCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  displayedCount,
  categories,
  totalCount,
}) => {
  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <div className="relative">
          <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-gray-50 px-1">Filter by Category</label>
          <select 
            value={currentFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="block w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
          >
            <option value="All Categories">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <span className="text-gray-500 text-sm">
        Showing {displayedCount} of {totalCount} products
      </span>
    </div>
  );
};