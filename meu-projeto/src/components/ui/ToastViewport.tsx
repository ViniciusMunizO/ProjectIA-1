import { Toast, type ToastVariant } from './Toast';

type ToastItem = {
  readonly id: number;
  readonly message: string;
  readonly variant: ToastVariant;
};

type ToastViewportProps = {
  readonly toasts: readonly ToastItem[];
  readonly onDismiss: (id: number) => void;
};

export const ToastViewport = ({ toasts, onDismiss }: ToastViewportProps) => (
  <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
    {toasts.map((toast) => (
      <Toast
        key={toast.id}
        message={toast.message}
        variant={toast.variant}
        onDismiss={() => onDismiss(toast.id)}
      />
    ))}
  </div>
);
