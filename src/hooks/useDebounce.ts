import { useCallback, useRef } from 'react';

export const useDebounce = (delay: number = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback((callback: () => void) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(callback, delay);
  }, [delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { debounce, cancel };
};