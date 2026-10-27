import React, { useState } from 'react';
import { ProductServices } from '../../services/ProductServices';
import { notifyUnauthorized } from '../../lib/apiError';
import { useToast } from '../atoms/toastContext';
import { Button } from '../atoms/Button';
import { Modal } from '../atoms/Modal';

interface ImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImported }) => {
  const toast = useToast();
  const [result, setResult] = useState<{ created: number; failed: { row: number; reason: string }[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('CSV file exceeds 2 MB.'); return; }
    setBusy(true);
    try {
      const outcome = await ProductServices.importCsv(file);
      setResult(outcome);
      if (outcome.created > 0) onImported();
      toast.success(`Imported ${outcome.created} product(s), ${outcome.failed.length} row(s) failed.`);
    } catch (err) {
      notifyUnauthorized(err);
      toast.error(err instanceof Error ? err.message : 'CSV import failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Import Products (CSV)" maxWidth="max-w-lg">
      <p className="text-sm text-slate-600 text-left mb-3">
        Header must be: <code className="text-xs">name,description,price,category_name,sku,stock,image_url</code>
      </p>
      <input type="file" accept=".csv,text/csv" disabled={busy} onChange={(e) => void handleFile(e.target.files?.[0])} className="block text-sm" />
      {result && (
        <div className="mt-4 text-left text-sm">
          <p className="font-semibold text-[#00241B]">Created: {result.created}</p>
          {result.failed.length > 0 && (
            <ul className="mt-2 space-y-1 text-red-700">
              {result.failed.map((failure) => (
                <li key={failure.row}>Row {failure.row}: {failure.reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};
