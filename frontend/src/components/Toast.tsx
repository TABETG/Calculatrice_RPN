import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: 'bg-emerald-500/90 border-emerald-400',
  error: 'bg-red-500/90 border-red-400',
  warning: 'bg-orange-500/90 border-orange-400',
  info: 'bg-blue-500/90 border-blue-400',
};

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toast({ toast, onClose }: ToastProps) {
  const Icon = toastIcons[toast.type];

  return (
    <div
      className={`${toastStyles[toast.type]} border-2 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm flex items-center gap-3 min-w-[300px] animate-slide-in`}
      role="alert"
      aria-live="assertive"
    >
      <Icon size={20} className="text-white flex-shrink-0" />
      <p className="text-white font-medium flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        aria-label="Fermer la notification"
      >
        <X size={18} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
