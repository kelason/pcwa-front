import React, { useState } from 'react';
import type { Product } from '../../types/catalog';
import { Button } from '../atoms/Button';
import { Modal } from '../atoms/Modal';

interface ProductDetailModalProps {
  product: Product;
  categoryName: string;
  canWrite: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product, categoryName, canWrite, onClose, onEdit,
}) => {
  const [imageBroken, setImageBroken] = useState(false);
  const showImage = Boolean(product.image_url) && !imageBroken;

  return (
    <Modal isOpen onClose={onClose} title={product.name} maxWidth="max-w-lg">
      {showImage ? (
        <img
          src={product.image_url as string}
          alt={product.name}
          className="w-full h-52 object-cover rounded-lg mb-4 bg-slate-50"
          onError={() => setImageBroken(true)}
        />
      ) : (
        <div className="w-full h-32 rounded-lg mb-4 bg-[#00241B]/5 flex items-center justify-center text-slate-400 text-sm">
          No image
        </div>
      )}
      <dl className="text-left space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-slate-500">Price</dt><dd className="font-semibold text-[#00241B]">${Number(product.price).toFixed(2)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Category</dt><dd className="font-medium">{categoryName}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Stock</dt><dd className="font-medium">{product.stock ?? 0}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">SKU</dt><dd className="font-medium">{product.sku || '—'}</dd></div>
      </dl>
      <p className="text-left text-sm text-slate-600 mt-4">{product.description || 'No description.'}</p>
      <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button disabled={!canWrite} onClick={() => onEdit(product)}>Edit</Button>
      </div>
    </Modal>
  );
};
