import { createContext, useContext } from 'react';

export interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

export const ToastContext = createContext<ToastApi>({
  success: () => undefined,
  error: () => undefined,
});

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
