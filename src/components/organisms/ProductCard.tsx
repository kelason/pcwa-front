import React from 'react';
import { type Product, type Category } from '../../../api';
import { Button } from '../atoms/Button';

interface ProductCardProps {
  product: Product;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, categories, onEdit, onDelete }) => {
  const categoryName = categories.find(c => c.id === product.category_id)?.name || 'Unknown Category';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm flex flex-col hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[#65B891]/20">      
      <div className="border-[#00241B] rounded-xl bg-[#00241B]/5 p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-[#00241B] text-left">{product.name}</h2>
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[#00241B] border border-[#65B891] rounded-full bg-[#93E5AB]/20">
            {categoryName}
          </span>
        </div>
        <p className="text-[#65B891] font-semibold text-lg mb-4 text-left">${Number(product.price).toFixed(2)}</p>
      </div>
      
      <div className="mt-auto flex gap-4 pt-4 border-t border-slate-50">
        <Button variant="ghost" onClick={() => onEdit(product)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </Button>
        <Button variant="danger" onClick={() => onDelete(String(product.id))}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </Button>
      </div>
    </div>
  );
};