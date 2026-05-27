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
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
      <p className="text-blue-600 text-lg mb-4">${Number(product.price).toFixed(2)}</p>
      
      <div className="mb-8">
        <span className="inline-block px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-full bg-blue-50">
          {categoryName}
        </span>
      </div>
      
      <div className="mt-auto flex gap-4 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={() => onEdit(product)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </Button>
        <Button variant="danger" onClick={() => onDelete(product.id)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </Button>
      </div>
    </div>
  );
};