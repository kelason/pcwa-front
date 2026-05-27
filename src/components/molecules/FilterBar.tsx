import React from 'react';
import { type Category } from '../../../api';

interface FilterBarProps {
  currentFilter: string | 'All Categories';
  onFilterChange: (categoryId: string | 'All Categories') => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  categories: Category[];
  displayedCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  displayedCount,
  categories,
  totalCount,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-4 flex-grow">
        <svg className="hidden md:block w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:max-w-2xl">
        <div className="relative w-full">
          <label className="text-xs text-[#4E878C] absolute -top-2 left-2 bg-white px-1 z-10 font-bold">Filter by Category</label>
          <select 
            value={currentFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="block w-full pt-3 pl-3 pr-10 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4E878C]/20 focus:border-[#4E878C] rounded-lg bg-[#FFFFFF] font-medium"
          >
            <option value="All Categories">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="relative w-full">
          <label className="text-xs text-[#4E878C] absolute -top-2 left-2 bg-white px-1 z-10 font-bold">Sort By</label>
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="block w-full pt-3 pl-3 pr-10 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4E878C]/20 focus:border-[#4E878C] rounded-lg bg-[#FFFFFF] font-medium"
          >
            <option value="name">Name</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
        </div>
      </div>
      
      <div className="text-slate-500 text-sm font-medium text-center lg:text-right whitespace-nowrap border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 lg:ml-4">
        Showing {displayedCount} of {totalCount} products
      </div>
    </div>
  );
};