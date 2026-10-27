import React, { useCallback, useRef, useState } from 'react';
import { ToastContext, type ToastApi } from './toastContext';

export interface ToastItem { id: number; kind: 'success' | 'error'; message: string }

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((kind: ToastItem['kind'], message: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-3), { id, kind, message }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4000);
  }, []);

  const api: ToastApi = {
    success: (message) => push('success', message),
    error: (message) => push('error', message),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[110] flex flex-col gap-2 w-[min(92vw,360px)]" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.kind === 'success'
                ? 'bg-white border-[#65B891] text-[#00241B]'
                : 'bg-white border-red-300 text-red-800'
            }`}
          >
            <span className="font-semibold mr-2">{toast.kind === 'success' ? 'Done' : 'Error'}</span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
