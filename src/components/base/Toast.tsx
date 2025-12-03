import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[380px] px-4">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: 'ri-checkbox-circle-fill',
    error: 'ri-close-circle-fill',
    warning: 'ri-alert-fill',
    info: 'ri-information-fill'
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500'
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-amber-800',
    info: 'text-blue-800'
  };

  return (
    <div 
      className={`${bgColors[toast.type]} border rounded-2xl p-4 shadow-lg animate-slide-down flex items-center gap-3`}
      onClick={onClose}
    >
      <div className={`${colors[toast.type]} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}>
        <i className={`${icons[toast.type]} text-white text-lg`}></i>
      </div>
      <p className={`${textColors[toast.type]} font-medium text-sm flex-1`}>{toast.message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <i className="ri-close-line text-lg"></i>
      </button>
    </div>
  );
}

// 전역에서 사용할 수 있는 toast 함수
let globalShowToast: ((message: string, type?: 'success' | 'error' | 'warning' | 'info') => void) | null = null;

export function setGlobalToast(showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void) {
  globalShowToast = showToast;
}

export function toast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  if (globalShowToast) {
    globalShowToast(message, type);
  } else {
    console.log(`Toast (${type}): ${message}`);
  }
}

export default ToastProvider;
