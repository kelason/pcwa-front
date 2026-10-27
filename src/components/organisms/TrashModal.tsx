import React, { useCallback, useEffect, useState } from 'react';
import type { Product } from '../../types/catalog';
import { notifyUnauthorized } from '../../lib/apiError';
import { ProductServices } from '../../services/ProductServices';
import { useToast } from '../atoms/toastContext';
import { Button } from '../atoms/Button';
import { Modal } from '../atoms/Modal';

interface TrashModalProps {
  onClose: () => void;
  onChanged: () => void;
}

const PAGE_SIZE = 10;

export const TrashModal: React.FC<TrashModalProps> = ({ onClose, onChanged }) => {
  const toast = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [auditFor, setAuditFor] = useState<string | null>(null);
  const [auditText, setAuditText] = useState('');

  const reportError = useCallback((err: unknown, fallback: string) => {
    notifyUnauthorized(err);
    toast.error(err instanceof Error ? err.message : fallback);
  }, [toast]);

  const load = useCallback(async () => {
    try {
      const data = await ProductServices.fetchTrash(page);
      setItems(data.products);
      setTotal(data.total);
    } catch (err) {
      reportError(err, 'Failed to load trash.');
    }
  }, [page, reportError]);

  useEffect(() => {
    let cancelled = false;
    ProductServices.fetchTrash(page)
      .then((data) => {
        if (cancelled) return;
        setItems(data.products);
        setTotal(data.total);
      })
      .catch((err: unknown) => { if (!cancelled) reportError(err, 'Failed to load trash.'); });
    return () => { cancelled = true; };
  }, [page, reportError]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const run = async (action: () => Promise<void>, success: string) => {
    try {
      await action();
      toast.success(success);
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else await load();
      onChanged();
    } catch (err) {
      reportError(err, 'Action failed.');
    }
  };

  const showAudit = async (id: string) => {
    try {
      const entries = await ProductServices.fetchAudit(id);
      setAuditFor(id);
      setAuditText(entries.map((e) => `${e.action} by ${e.actor}`).join('\n') || 'No audit entries.');
    } catch (err) {
      reportError(err, 'Failed to load audit trail.');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Trash" maxWidth="max-w-lg">
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {items.map((product) => (
          <div key={product.id} className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
            <span className="flex-1 text-left font-medium text-[#00241B]">{product.name}</span>
            <Button variant="secondary" onClick={() => void run(() => ProductServices.restoreProduct(String(product.id)).then(() => undefined), 'Product restored.')}>Restore</Button>
            <Button variant="ghost" onClick={() => void showAudit(String(product.id))}>Audit</Button>
            <Button variant="danger" onClick={() => void run(() => ProductServices.deletePermanently(String(product.id)), 'Product permanently deleted.')}>Delete forever</Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500 text-left">Trash is empty.</p>}
      </div>
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-3 text-sm text-slate-500">
          <span>Page {page} of {totalPages} ({total} items)</span>
          <span className="flex gap-2">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </span>
        </div>
      )}
      {auditFor && (
        <pre className="mt-4 text-left text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap">{auditText}</pre>
      )}
      <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};
