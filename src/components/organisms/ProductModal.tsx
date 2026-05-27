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
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateName = (name: string): string | null => {
    if (name.trim().length === 0) {
      return 'Product name cannot be empty.';
    }
    if (name.length < 1 || name.length > 25) {
      return 'Product name must be between 1 and 25 characters.';
    }
    return null;
  };

  const validatePrice = (price: string): string | null => {
    if (price.trim().length === 0) {
      return 'Price cannot be empty.';
    }
    if (price.length < 1 || price.length > 8) {
      return 'Price must be between 1 and 8 characters.';
    }
    const numValue = parseFloat(price);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Price must be a valid positive number or must be greater than 0.';
    }
    return null;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
    setNameError(validateName(value));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, price: value });
    setPriceError(validatePrice(value));
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent 'e', 'E', '+', '-' characters in number input
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Perform all validations before submission
    const newNameError = validateName(formData.name);
    const newPriceError = validatePrice(formData.price);

    setNameError(newNameError);
    setPriceError(newPriceError);

    if (newNameError || newPriceError) {
      return; // Prevent submission if there are errors
    }

    onSubmit(e, formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Product' : 'Add New Product'}
    >
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Product Name">
            <input 
              type="text" 
              placeholder=" "
              required
              minLength={1}
              maxLength={25}
              value={formData.name}
              onChange={handleNameChange}
              className={FORM_INPUT_CLASSES}
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </FormField>
          
          <FormField label="Price ($)">
            <input 
              type="number" 
              placeholder=" "
              required
              step="0.01"
              min="0"
              maxLength={8}
              value={formData.price}
              onChange={handlePriceChange}
              onKeyDown={handlePriceKeyDown}
              className={FORM_INPUT_CLASSES}
            />
            {priceError && <p className="text-red-500 text-xs mt-1">{priceError}</p>}
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