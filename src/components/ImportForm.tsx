import React, { useState, FormEvent, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Copy, Trash2, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, ImportFormRef } from '../types';
import { useFormValidation } from '../hooks/useFormValidation';
import { useDebounce } from '../hooks/useDebounce';
import { useRetry } from '../hooks/useRetry';
import { useUserPreferences } from '../store/userPreferences';
import { useBreakpoint } from '../hooks/useMediaQuery';
import { useToast } from '../components/Toast/ToastProvider';
import ProgressBar from './ProgressBar';
import { figmaApiService } from '../services/figmaApi';

interface ImportFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  progress: number;
}

const ImportForm = forwardRef<ImportFormRef, ImportFormProps>(({ onSubmit, isLoading, progress }, ref) => {
  const { preferences } = useUserPreferences();
  const { isMobile } = useBreakpoint();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    figmaUrl: '',
    restApi: ''
  });
  const [showRestApi, setShowRestApi] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [eta, setEta] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isValidatingToken, setIsValidatingToken] = useState(false);

  const { errors, validateForm, validateField, clearError, setError, clearAllErrors } = useFormValidation();
  const { debounce: debounceGeneral } = useDebounce(300);
  const { debounce: debounceApiToken } = useDebounce(1000);
  const { executeWithRetry, retryState } = useRetry(onSubmit);

  // Load recent URLs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('figma-recent-urls');
    if (saved) {
      try {
        setRecentUrls(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load recent URLs:', error);
      }
    }
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate ETA based on progress
  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const estimatedTotal = 30; // 30 seconds estimated total time
      const remaining = ((100 - progress) / 100) * estimatedTotal;
      setEta(Math.ceil(remaining));
    } else {
      setEta(0);
    }
  }, [progress]);

  const resetForm = useCallback(() => {
    setFormData({
      figmaUrl: '',
      restApi: ''
    });
    clearAllErrors();
    setSubmitError('');
    setShowRestApi(false);
  }, [clearAllErrors]);

  const saveRecentUrl = useCallback((url: string) => {
    const updated = [url, ...recentUrls.filter(u => u !== url)].slice(0, 5);
    setRecentUrls(updated);
    localStorage.setItem('figma-recent-urls', JSON.stringify(updated));
  }, [recentUrls]);

  // Validate API token function
  const validateApiToken = useCallback(async (token: string) => {
    if (!token || token.length < 10) return;
    
    setIsValidatingToken(true);
    try {
      const isValid = await figmaApiService.validateToken(token);
      if (!isValid) {
        setError('restApi', 'Invalid API token');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
    } finally {
      setIsValidatingToken(false);
    }
  }, [setError]);

  useImperativeHandle(ref, () => ({
    fillDemoData: () => {
      const demoData = {
        figmaUrl: 'https://www.figma.com/file/abc123/Sample-Design',
        restApi: 'demo_api_key_12345678'
      };
      setFormData(demoData);
      clearAllErrors();
      setSubmitError('');
    },
    resetForm,
    validateForm: () => validateForm(formData)
  }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      showToast({
        type: 'error',
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.'
      });
      return;
    }
    
    if (!validateForm(formData)) return;

    try {
      setSubmitError('');
      
      if (preferences.maxRetries > 0) {
        await executeWithRetry(formData);
      } else {
        await onSubmit(formData);
      }
      
      saveRecentUrl(formData.figmaUrl);
      
      if (preferences.notifications) {
        showToast({
          type: 'success',
          title: 'Import Successful',
          message: 'Your Figma design has been imported successfully!'
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hiba történt az import során';
      setSubmitError(message);
      
      if (preferences.notifications) {
        showToast({
          type: 'error',
          title: 'Import Failed',
          message: message
        });
      }
    }
  };

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
    setSubmitError('');

    // Special handling for API token validation
    if (field === 'restApi' && value.trim().length >= 10) {
      debounceApiToken(() => {
        validateApiToken(value.trim());
      });
    }

    // Debounced validation
    if (value.trim()) {
      debounceGeneral(() => {
        const error = validateField(field, value);
        if (error) {
          setError(field, error);
        }
      });
    }
  }, [clearError, debounceGeneral, debounceApiToken, validateField, setError, validateApiToken]);

  const handleRecentUrlClick = useCallback((url: string) => {
    handleInputChange('figmaUrl', url);
  }, [handleInputChange]);

  const handleCopyApiKey = useCallback(async () => {
    if (formData.restApi) {
      try {
        await navigator.clipboard.writeText(formData.restApi);
        // Could add a toast notification here
      } catch (error) {
        console.error('Failed to copy API key:', error);
      }
    }
  }, [formData.restApi]);

  const clearRecentUrls = useCallback(() => {
    setRecentUrls([]);
    localStorage.removeItem('figma-recent-urls');
  }, []);

  return (
    <div className={`h-full flex flex-col bg-neutral-900 text-white ${
      preferences.compactMode ? 'text-sm' : ''
    }`}>
      {/* Header */}
      <header className={`${
        preferences.compactMode ? 'h-12 px-4' : 'h-14 px-6'
      } flex items-center justify-between border-t md:border-t-0 border-neutral-800 animate-slide-in [animation-delay:180ms]`}>
        <div className="flex items-center gap-2">
          <h2 className={`${
            preferences.compactMode ? 'text-xs' : 'text-sm'
          } font-semibold tracking-tight`}>
            Import Figma
          </h2>
          
          {/* Online/Offline indicator */}
          <div className={`flex items-center gap-1 ${
            isOnline ? 'text-green-400' : 'text-red-400'
          }`}>
            {isOnline ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            <span className="text-[10px]">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        {formData.figmaUrl || formData.restApi ? (
          <button
            type="button"
            onClick={resetForm}
            className={`${
              preferences.compactMode ? 'text-[10px]' : 'text-xs'
            } text-neutral-400 hover:text-neutral-300 transition-colors`}
            title="Clear form"
          >
            Clear
          </button>
        ) : null}
      </header>

      {/* Form */}
      <form 
        onSubmit={handleSubmit} 
        className={`flex-1 ${
          preferences.compactMode ? 'px-4 py-4 space-y-4' : 'px-6 py-6 space-y-6'
        } overflow-y-auto animate-slide-in [animation-delay:240ms]`}
      >
        {/* Retry Status */}
        <AnimatePresence>
          {retryState.isRetrying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-orange-900/20 border border-orange-500/20 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-orange-400 animate-pulse" />
              <div>
                <p className="text-sm text-orange-400 font-medium">
                  Retrying... (Attempt {retryState.attempt + 1})
                </p>
                <p className="text-xs text-orange-300 mt-1">
                  Connection issues detected, retrying automatically
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Error */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg flex items-start gap-2"
            >
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-400 font-medium">Import Error</p>
              <p className="text-xs text-red-300 mt-1">{submitError}</p>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success indicator */}
        <AnimatePresence>
          {progress === 100 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-3 bg-green-900/20 border border-green-500/20 rounded-lg flex items-center gap-2"
            >
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-sm text-green-400 font-medium">Import completed successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inputs */}
        <div className={`space-y-${preferences.compactMode ? '3' : '4'}`}>
          {/* Figma URL */}
          <div className="space-y-2">
            <label htmlFor="figma-url" className={`block ${
              preferences.compactMode ? 'text-[10px]' : 'text-xs'
            } font-medium text-neutral-300`}>
              Figma URL *
            </label>
            <div className="relative">
              <input
                id="figma-url"
                type="url"
                placeholder="https://www.figma.com/file/..."
                value={formData.figmaUrl}
                onChange={(e) => handleInputChange('figmaUrl', e.target.value)}
                className={`peer ${
                  preferences.compactMode ? 'h-8 px-8 text-[11px]' : 'h-10 px-10 text-xs'
                } w-full rounded-xl border bg-neutral-800 placeholder-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition ${
                  errors.figmaUrl ? 'border-red-500 text-red-300' : 'border-neutral-700'
                }`}
                required
                disabled={isLoading}
                aria-invalid={!!errors.figmaUrl}
                aria-describedby={errors.figmaUrl ? 'figma-url-error' : undefined}
              />
              <Eye className={`absolute ${
                preferences.compactMode ? 'left-2 w-3 h-3' : 'left-3 w-4 h-4'
              } top-1/2 -translate-y-1/2 text-neutral-500 peer-focus:text-purple-400`} />
              {errors.figmaUrl && (
                <p id="figma-url-error" className={`mt-1 ${
                  preferences.compactMode ? 'text-[10px]' : 'text-xs'
                } text-red-500 flex items-center gap-1`} role="alert">
                  <AlertCircle className="w-3 h-3" />
                  {errors.figmaUrl}
                </p>
              )}
            </div>

            {/* Recent URLs */}
            {recentUrls.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`${
                    preferences.compactMode ? 'text-[8px]' : 'text-[10px]'
                  } text-neutral-400 uppercase font-medium`}>
                    Recent URLs
                  </span>
                  <button
                    type="button"
                    onClick={clearRecentUrls}
                    className={`${
                      preferences.compactMode ? 'text-[8px]' : 'text-[10px]'
                    } text-neutral-500 hover:text-neutral-400 transition-colors`}
                  >
                    <Trash2 className={`${
                      preferences.compactMode ? 'w-2 h-2' : 'w-3 h-3'
                    }`} />
                  </button>
                </div>
                <div className={`space-y-1 ${
                  preferences.compactMode ? 'max-h-16' : 'max-h-20'
                } overflow-y-auto`}>
                  {recentUrls.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleRecentUrlClick(url)}
                      className={`w-full text-left ${
                        preferences.compactMode ? 'text-[10px] p-1.5' : 'text-xs p-2'
                      } text-neutral-400 hover:text-neutral-300 rounded-lg hover:bg-neutral-800/50 transition-colors truncate`}
                      title={url}
                    >
                      {url}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rest API */}
          <div className="space-y-2">
            <label htmlFor="rest-api" className={`block ${
              preferences.compactMode ? 'text-[10px]' : 'text-xs'
            } font-medium text-neutral-300`}>
              Figma API Token *
            </label>
            <div className="relative">
              <input
                id="rest-api"
                type={showRestApi ? 'text' : 'password'}
                placeholder="Enter your Figma API token"
                value={formData.restApi}
                onChange={(e) => handleInputChange('restApi', e.target.value)}
                className={`peer ${
                  preferences.compactMode ? 'h-8 px-8 pr-16 text-[11px]' : 'h-10 px-10 pr-20 text-xs'
                } w-full rounded-xl border bg-neutral-800 placeholder-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition ${
                  errors.restApi ? 'border-red-500 text-red-300' : 'border-neutral-700'
                } ${isValidatingToken ? 'border-orange-500' : ''}`}
                required
                disabled={isLoading}
                aria-invalid={!!errors.restApi}
                aria-describedby={errors.restApi ? 'rest-api-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowRestApi(!showRestApi)}
                className={`absolute ${
                  preferences.compactMode ? 'left-2 w-3 h-3' : 'left-3 w-4 h-4'
                } top-1/2 -translate-y-1/2 text-neutral-500 peer-focus:text-purple-400 hover:text-purple-400 transition`}
                aria-label={showRestApi ? 'Hide API token' : 'Show API token'}
                aria-pressed={showRestApi}
              >
                {showRestApi ? (
                  <Eye className={`${preferences.compactMode ? 'w-3 h-3' : 'w-4 h-4'}`} />
                ) : (
                  <EyeOff className={`${preferences.compactMode ? 'w-3 h-3' : 'w-4 h-4'}`} />
                )}
              </button>
              {formData.restApi && (
                <button
                  type="button"
                  onClick={handleCopyApiKey}
                  className={`absolute ${
                    preferences.compactMode ? 'right-2 w-3 h-3' : 'right-3 w-4 h-4'
                  } top-1/2 -translate-y-1/2 text-neutral-500 hover:text-purple-400 transition`}
                  aria-label="Copy API token"
                  title="Copy API token"
                >
                  <Copy className={`${preferences.compactMode ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </button>
              )}
              
              {/* Validation indicator */}
              {isValidatingToken && (
                <div className={`absolute ${
                  preferences.compactMode ? 'right-6 w-3 h-3' : 'right-8 w-4 h-4'
                } top-1/2 -translate-y-1/2`}>
                  <div className="animate-spin rounded-full border-2 border-orange-400 border-t-transparent w-full h-full" />
                </div>
              )}
              
              {errors.restApi && (
                <p id="rest-api-error" className={`mt-1 ${
                  preferences.compactMode ? 'text-[10px]' : 'text-xs'
                } text-red-500 flex items-center gap-1`} role="alert">
                  <AlertCircle className="w-3 h-3" />
                  {errors.restApi}
                </p>
              )}
            </div>
            <p className={`${
              preferences.compactMode ? 'text-[8px]' : 'text-[10px]'
            } text-neutral-500`}>
              Get your token from{' '}
              <a 
                href="https://www.figma.com/developers/api#access-tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Figma Settings
              </a>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {(progress > 0 || isLoading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ProgressBar 
                progress={progress} 
                label="Import Progress"
                showEta={true}
                eta={eta}
                variant="purple"
                size={preferences.compactMode ? "sm" : "md"}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.figmaUrl.trim() || !formData.restApi.trim()}
          className={`w-full rounded-xl bg-gradient-to-b from-purple-600 to-purple-700 ${
            preferences.compactMode ? 'py-2 text-xs' : 'py-3 text-sm'
          } font-semibold tracking-tight shadow-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100`}
          aria-busy={isLoading}
          aria-disabled={isLoading}
        >
          {isLoading ? 'Importing...' : 'Start Import'}
        </button>

        {/* Help text */}
        {!preferences.compactMode && (
          <div className={`${
            isMobile ? 'text-[9px]' : 'text-[10px]'
          } text-neutral-500 space-y-1`}>
            <p>• Make sure your Figma file is publicly accessible or you have proper permissions</p>
            <p>• The API token should have file read permissions</p>
            <p>• Large files may take longer to process</p>
          </div>
        )}
      </form>
    </div>
  );
});

ImportForm.displayName = 'ImportForm';

export default ImportForm;
