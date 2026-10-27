import React, { useState } from 'react';
import type { Category } from '../../types/catalog';
import { Button } from '../atoms/Button';

interface BulkActionBarProps {
  count: number;
  categories: Category[];
  onDelete: () => void;
  onCategorize: (categoryId: string) => void;
  onClear: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ count, categories, onDelete, onCategorize, onClear }) => {
  const [categoryId, setCategoryId] = useState('');
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#00241B] text-white rounded-xl px-4 py-3 shadow-sm">
      <span className="text-sm font-semibold">{count} selected</span>
      <select
        aria-label="Move selected to category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="text-sm text-[#00241B] rounded-lg px-2 py-2 bg-white"
      >
        <option value="">Move to category…</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <Button variant="secondary" disabled={!categoryId} onClick={() => categoryId && onCategorize(categoryId)}>Apply category</Button>
      <Button variant="danger" onClick={onDelete}>Delete selected</Button>
      <Button variant="ghost" onClick={onClear}>Clear</Button>
    </div>
  );
};
