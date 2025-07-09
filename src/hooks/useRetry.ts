import { useState, useCallback } from 'react';
import { useUserPreferences } from '../store/userPreferences';

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  error: Error | null;
}

interface UseRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

export const useRetry = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: UseRetryOptions = {}
) => {
  const { preferences } = useUserPreferences();
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    error: null
  });

  const maxRetries = options.maxRetries ?? preferences.maxRetries;
  const baseDelay = options.baseDelay ?? preferences.retryDelay;

  const executeWithRetry = useCallback(
    async (...args: T): Promise<R> => {
      setRetryState({ isRetrying: true, attempt: 0, error: null });

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setRetryState(prev => ({ ...prev, attempt }));
          
          const result = await operation(...args);
          
          setRetryState({ isRetrying: false, attempt, error: null });
          options.onSuccess?.();
          
          return result;
        } catch (error) {
          const err = error as Error;
          
          if (attempt === maxRetries) {
            setRetryState({ isRetrying: false, attempt, error: err });
            options.onFailure?.(err);
            throw err;
          }

          options.onRetry?.(attempt + 1);
          
          // Exponential backoff with jitter
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      throw new Error('Unexpected retry loop exit');
    },
    [operation, maxRetries, baseDelay, options]
  );

  const reset = useCallback(() => {
    setRetryState({ isRetrying: false, attempt: 0, error: null });
  }, []);

  return {
    executeWithRetry,
    retryState,
    reset
  };
};