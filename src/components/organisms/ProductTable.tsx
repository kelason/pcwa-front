import React from 'react';
import type { Category, Product } from '../../types/catalog';
import { Button } from '../atoms/Button';

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  selectedIds: Set<string>;
  canWrite: boolean;
  onToggleSelect: (id: string) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products, categories, selectedIds, canWrite, onToggleSelect, onView, onEdit, onDelete,
}) => {
  const categoryName = (id: string) => categories.find((c) => String(c.id) === String(id))?.name || 'Unknown Category';
  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 text-[#4E878C]">
            <th scope="col" className="px-4 py-3"><span className="sr-only">Select</span></th>
            <th scope="col" className="px-4 py-3">Name</th>
            <th scope="col" className="px-4 py-3">Category</th>
            <th scope="col" className="px-4 py-3">Price</th>
            <th scope="col" className="px-4 py-3">Stock</th>
            <th scope="col" className="px-4 py-3">SKU</th>
            <th scope="col" className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => onView(product)}>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" aria-label={`Select ${product.name}`} checked={selectedIds.has(String(product.id))}
                  disabled={!canWrite} onChange={() => onToggleSelect(String(product.id))} className="accent-[#4E878C]" />
              </td>
              <td className="px-4 py-3 font-semibold text-[#00241B]">{product.name}</td>
              <td className="px-4 py-3">{categoryName(String(product.category_id))}</td>
              <td className="px-4 py-3">${Number(product.price).toFixed(2)}</td>
              <td className="px-4 py-3">{product.stock ?? 0}</td>
              <td className="px-4 py-3">{product.sku || '—'}</td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => onView(product)}>View</Button>
                  <Button variant="ghost" disabled={!canWrite} onClick={() => onEdit(product)}>Edit</Button>
                  <Button variant="danger" disabled={!canWrite} onClick={() => onDelete(String(product.id))}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
