import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
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
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto-hide toast
    if (newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, [maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/30';
      case 'error':
        return 'bg-red-900/20 border-red-500/30';
      case 'warning':
        return 'bg-orange-900/20 border-orange-500/30';
      case 'info':
        return 'bg-blue-900/20 border-blue-500/30';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.95 }}
              className={`p-4 rounded-xl border backdrop-blur-sm shadow-lg ${getColors(toast.type)}`}
            >
              <div className="flex items-start gap-3">
                {getIcon(toast.type)}
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="text-xs text-neutral-300 mt-1">
                      {toast.message}
                    </p>
                  )}
                  {toast.action && (
                    <button
                      onClick={toast.action.onClick}
                      className="text-xs text-purple-400 hover:text-purple-300 mt-2 font-medium"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => hideToast(toast.id)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};