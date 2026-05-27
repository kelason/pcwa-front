import React, { useState } from 'react';
import { type Product, type Category } from '../../../api';
import { Button } from '../atoms/Button';
import { FormField, FORM_INPUT_CLASSES } from '../molecules/FormField';
import { Modal } from '../atoms/Modal';

interface ProductModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  initialFormData: { name: string; price: string; category_id: string };
  categories: Category[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent, formData: { name: string; price: string; category_id: string }) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  editingProduct,
  initialFormData,
  categories,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(initialFormData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Product' : 'Add New Product'}
    >
        
        <form onSubmit={(e) => onSubmit(e, formData)} className="space-y-4">
          <FormField label="Product Name">
            <input 
              type="text" 
              placeholder=" "
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={FORM_INPUT_CLASSES}
            />
          </FormField>
          
          <FormField label="Price ($)">
            <input 
              type="number" 
              placeholder=" "
              required
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className={FORM_INPUT_CLASSES}
            />
          </FormField>

          <FormField label="Category">
            <select 
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              className={FORM_INPUT_CLASSES}
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
    </Modal>
  );
};