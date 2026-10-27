import React, { useState } from 'react';
import type { Category, Product } from '../../types/catalog';
import { notifyUnauthorized } from '../../lib/apiError';
import type { ProductFormValues } from '../../lib/productForm';
import { validateProductName, validateProductPrice } from '../../lib/validation';
import { UploadServices } from '../../services/UploadServices';
import { useToast } from '../atoms/toastContext';
import { Button } from '../atoms/Button';
import { FormField, FORM_INPUT_CLASSES } from '../molecules/FormField';
import { Modal } from '../atoms/Modal';

interface ProductModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  initialFormData: ProductFormValues;
  categories: Category[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent, formData: ProductFormValues) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen, editingProduct, initialFormData, categories, onClose, onSubmit,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState(initialFormData);
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    const problem = UploadServices.validateImage(file);
    if (problem) { toast.error(problem); return; }
    setUploading(true);
    try {
      const url = await UploadServices.uploadProductImage(file);
      setFormData((current) => ({ ...current, image_url: url }));
      toast.success('Image uploaded.');
    } catch (err) {
      notifyUnauthorized(err);
      toast.error(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNameError = validateProductName(formData.name);
    const newPriceError = validateProductPrice(formData.price);
    setNameError(newNameError);
    setPriceError(newPriceError);
    if (newNameError || newPriceError) return;
    if (!formData.category_id) { toast.error('Please choose a category.'); return; }
    const stock = Number(formData.stock);
    if (!Number.isInteger(stock) || stock < 0) { toast.error('Stock must be a whole number of 0 or more.'); return; }
    onSubmit(e, formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? 'Edit Product' : 'Add New Product'} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <FormField label="Product Name">
          <input
            type="text" placeholder=" " required minLength={1} maxLength={25}
            value={formData.name}
            onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setNameError(validateProductName(e.target.value)); }}
            className={FORM_INPUT_CLASSES}
          />
          {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
        </FormField>

        <FormField label="Description">
          <textarea
            placeholder=" " rows={3} value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={FORM_INPUT_CLASSES}
          />
        </FormField>

        <FormField label="Price ($)">
          <input
            type="number" placeholder=" " required step="0.01" min="0"
            value={formData.price}
            onChange={(e) => { setFormData({ ...formData, price: e.target.value }); setPriceError(validateProductPrice(e.target.value)); }}
            onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
            className={FORM_INPUT_CLASSES}
          />
          {priceError && <p className="text-red-500 text-xs mt-1">{priceError}</p>}
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Stock">
            <input
              type="number" placeholder=" " min="0" step="1" value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className={FORM_INPUT_CLASSES}
            />
          </FormField>
          <FormField label="SKU">
            <input
              type="text" placeholder=" " value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className={FORM_INPUT_CLASSES}
            />
          </FormField>
        </div>

        <FormField label="Category">
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className={FORM_INPUT_CLASSES}
          >
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>

        <FormField label="Image URL">
          <input
            type="url" placeholder=" " value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className={FORM_INPUT_CLASSES}
          />
        </FormField>
        <label className="block text-left text-sm text-slate-600">
          Or upload an image (PNG, JPEG or WebP, up to 5 MB)
          <input
            type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading}
            onChange={(e) => void handleImageFile(e.target.files?.[0])}
            className="block mt-1 text-sm"
          />
        </label>
        {formData.image_url && (
          <img src={formData.image_url} alt="Product preview" className="w-full h-36 object-cover rounded-lg bg-slate-50" />
        )}

        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={uploading}>{editingProduct ? 'Save Changes' : 'Add Product'}</Button>
        </div>
      </form>
    </Modal>
  );
};
