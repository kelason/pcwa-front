import React, { useState } from 'react';
import type { Category } from '../../types/catalog';
import { notifyUnauthorized } from '../../lib/apiError';
import { CategoryServices } from '../../services/CategoryServices';
import { useToast } from '../atoms/toastContext';
import { Button } from '../atoms/Button';
import { Modal } from '../atoms/Modal';

interface CategoryManagerProps {
  categories: Category[];
  onClose: () => void;
  onChanged: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onClose, onChanged }) => {
  const toast = useToast();
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      onChanged();
    } catch (err) {
      notifyUnauthorized(err);
      toast.error(err instanceof Error ? err.message : 'Category action failed.');
    } finally {
      setBusy(false);
    }
  };

  const create = () => {
    const name = newName.trim();
    if (!name) { toast.error('Category name cannot be empty.'); return; }
    void run(async () => { await CategoryServices.createCategory(name); setNewName(''); }, 'Category created.');
  };

  return (
    <Modal isOpen onClose={onClose} title="Manage Categories" maxWidth="max-w-lg">
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-2">
            <input
              aria-label={`Category name ${category.name}`}
              value={editing[String(category.id)] ?? category.name}
              onChange={(e) => setEditing((cur) => ({ ...cur, [String(category.id)]: e.target.value }))}
              className="flex-1 border-2 border-gray-200 rounded p-2 text-sm text-[#00241B] outline-none focus:border-[#4E878C]"
            />
            <Button
              variant="secondary" disabled={busy}
              onClick={() => {
                const name = (editing[String(category.id)] ?? category.name).trim();
                if (!name) { toast.error('Category name cannot be empty.'); return; }
                void run(async () => { await CategoryServices.updateCategory(String(category.id), name); }, 'Category renamed.');
              }}
            >
              Save
            </Button>
            <Button
              variant="danger" disabled={busy}
              onClick={() => void run(async () => { await CategoryServices.deleteCategory(String(category.id)); }, 'Category deleted.')}
            >
              Delete
            </Button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-slate-500 text-left">No categories yet.</p>}
      </div>
      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
        <input
          aria-label="New category name" placeholder="New category name" value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border-2 border-gray-200 rounded p-2 text-sm text-[#00241B] outline-none focus:border-[#4E878C]"
        />
        <Button disabled={busy} onClick={create}>Add</Button>
      </div>
      <div className="flex justify-end pt-4">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};
