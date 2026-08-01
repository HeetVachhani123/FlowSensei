import { createContext, useContext, useState, type ReactNode } from 'react';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // milliseconds
}

interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = (options: ToastOptions) => {
    const id = options.id || Math.random().toString(36).substr(2, 9);
    const toastToAdd = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant ?? 'default',
      duration: options.duration ?? 5000,
    };
    setToasts(prev => [...prev, toastToAdd]);
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toastToAdd.duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

type ToastContainerProps = {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
};

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed top-[68px] right-4 z-[60] flex flex-col gap-4 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex w-full items-start rounded-lg border p-4 shadow-lg ${
            toast.variant === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : toast.variant === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.variant === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : toast.variant === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-zinc-50 border-zinc-200 text-zinc-800'
          } ${toast.variant === 'success'
              ? 'dark:bg-green-900/20 dark:border-green-700/60 dark:text-green-200'
              : toast.variant === 'error'
              ? 'dark:bg-red-900/20 dark:border-red-700/60 dark:text-red-200'
              : toast.variant === 'warning'
              ? 'dark:bg-yellow-900/20 dark:border-yellow-700/60 dark:text-yellow-200'
              : toast.variant === 'info'
              ? 'dark:bg-blue-900/20 dark:border-blue-700/60 dark:text-blue-200'
              : 'dark:bg-zinc-900/60 dark:border-zinc-700/80 dark:text-zinc-200'}`}
        >
          <div className="flex-shrink-0 flex h-3.5 w-3.5 items-center justify-center">
            {toast.variant === 'success' && (
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.variant === 'error' && (
              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.variant === 'warning' && (
              <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.variant === 'info' && (
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {!['success', 'error', 'warning', 'info'].includes(toast.variant) && (
              <svg className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="ml-3 space-y-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="text-xs">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-auto flex h-3.5 w-3.5 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/20"
          >
            <svg className="h-3 w-3 text-zinc-400 hover:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};