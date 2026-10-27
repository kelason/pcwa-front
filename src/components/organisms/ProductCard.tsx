import React from 'react';
import type { Category, Product } from '../../types/catalog';
import { Button } from '../atoms/Button';

interface ProductCardProps {
  product: Product;
  categories: Category[];
  selected: boolean;
  canWrite: boolean;
  onToggleSelect: (id: string) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product, categories, selected, canWrite, onToggleSelect, onView, onEdit, onDelete,
}) => {
  const categoryName = categories.find((c) => String(c.id) === String(product.category_id))?.name || 'Unknown Category';
  const outOfStock = (product.stock ?? 0) <= 0;

  return (
    <article
      className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(product)}
    >
      <div className="rounded-xl bg-[#00241B]/5 p-4 mb-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex items-start gap-2 min-w-0">
            <input
              type="checkbox"
              aria-label={`Select ${product.name}`}
              checked={selected}
              disabled={!canWrite}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onToggleSelect(String(product.id))}
              className="mt-1 accent-[#4E878C]"
            />
            <h2 className="text-xl font-bold text-[#00241B] text-left break-words min-w-0">{product.name}</h2>
          </div>
          <span className="shrink-0 inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[#00241B] border border-[#65B891] rounded-full bg-[#93E5AB]/20">
            {categoryName}
          </span>
        </div>
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-32 object-cover rounded-lg mb-3 bg-white"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <p className="text-[#4E878C] font-semibold text-lg text-left">${Number(product.price).toFixed(2)}</p>
        {product.description && (
          <p className="text-sm text-slate-600 text-left mt-1 line-clamp-2">{product.description}</p>
        )}
        <p className={`text-xs font-semibold text-left mt-2 ${outOfStock ? 'text-red-600' : 'text-[#4E878C]'}`}>
          {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
          {product.sku ? ` · SKU ${product.sku}` : ''}
        </p>
      </div>

      <div className="mt-auto flex gap-4 pt-4 border-t border-slate-50" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" onClick={() => onView(product)} aria-label={`View ${product.name}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </Button>
        <Button variant="ghost" disabled={!canWrite} onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </Button>
        <Button variant="danger" disabled={!canWrite} onClick={() => onDelete(String(product.id))} aria-label={`Delete ${product.name}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </Button>
      </div>
    </article>
  );
};
