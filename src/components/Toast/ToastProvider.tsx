import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
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
  defaultPosition?: Toast['position'];
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5,
  defaultPosition = 'top-right'
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [timeouts, setTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
      position: toast.position ?? defaultPosition
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto-hide toast (unless persistent)
    if (!newToast.persistent && newToast.duration > 0) {
      const timeout = setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
      
      setTimeouts(prev => new Map(prev).set(id, timeout));
    }
  }, [maxToasts, defaultPosition]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prev.filter(t => t.id !== id);
    });
    
    // Clear timeout if it exists
    const timeout = timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      setTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  }, [timeouts]);

  const clearAllToasts = useCallback(() => {
    // Clear all timeouts
    timeouts.forEach(timeout => clearTimeout(timeout));
    setTimeouts(new Map());
    setToasts([]);
  }, [timeouts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [timeouts]);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
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

  const getContainerPosition = (position: Toast['position']) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const getAnimationProps = (position: Toast['position']) => {
    const isLeft = position?.includes('left');
    const isCenter = position?.includes('center');
    const isBottom = position?.includes('bottom');
    
    return {
      initial: { 
        opacity: 0, 
        x: isLeft ? -300 : isCenter ? 0 : 300,
        y: isBottom ? 100 : isCenter ? -100 : 0,
        scale: 0.95 
      },
      animate: { 
        opacity: 1, 
        x: 0, 
        y: 0,
        scale: 1 
      },
      exit: { 
        opacity: 0, 
        x: isLeft ? -300 : isCenter ? 0 : 300,
        y: isBottom ? 100 : isCenter ? -100 : 0,
        scale: 0.95 
      }
    };
  };

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const pos = toast.position || 'top-right';
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(toast);
    return acc;
  }, {} as Record<string, Toast[]>);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      
      {/* Toast Containers for each position */}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div 
          key={position}
          className={`fixed z-[100] space-y-2 max-w-sm w-full ${getContainerPosition(position as Toast['position'])}`}
        >
          <AnimatePresence>
            {positionToasts.map((toast) => (
              <motion.div
                key={toast.id}
                {...getAnimationProps(toast.position)}
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
      ))}
    </ToastContext.Provider>
  );
};