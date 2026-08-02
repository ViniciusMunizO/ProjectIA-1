import { useCallback, useState } from 'react';
import type { ToastVariant } from '../components/ui/Toast';

type ToastItem = {
  readonly id: number;
  readonly message: string;
  readonly variant: ToastVariant;
};

let nextToastId = 1;

export const useToasts = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, variant: ToastVariant): void => {
    const id = nextToastId;
    nextToastId += 1;
    setToasts((current) => [...current, { id, message, variant }]);
  }, []);

  const dismissToast = useCallback((id: number): void => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, pushToast, dismissToast };
};
