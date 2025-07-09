import { useState, useCallback } from 'react';
import { FormData, FormErrors } from '../types';

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateUrl = useCallback((url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  const validateFigmaUrl = useCallback((url: string): boolean => {
    if (!validateUrl(url)) return false;
    return url.includes('figma.com') && (url.includes('/file/') || url.includes('/design/'));
  }, [validateUrl]);

  const validateApiKey = useCallback((key: string): boolean => {
    return key.trim().length >= 10 && /^[a-zA-Z0-9_-]+$/.test(key.trim());
  }, []);

  const validateForm = useCallback((formData: FormData): boolean => {
    const newErrors: FormErrors = {};

    // Figma URL validation
    if (!formData.figmaUrl.trim()) {
      newErrors.figmaUrl = 'A Figma URL megadása kötelező!';
    } else if (!validateFigmaUrl(formData.figmaUrl.trim())) {
      newErrors.figmaUrl = 'Kérjük, érvényes Figma fájl URL-t adj meg!';
    }

    // API key validation
    if (!formData.restApi.trim()) {
      newErrors.restApi = 'Az API kulcs megadása kötelező!';
    } else if (!validateApiKey(formData.restApi)) {
      newErrors.restApi = 'Az API kulcs formátuma nem megfelelő!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateFigmaUrl, validateApiKey]);

  const validateField = useCallback((field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'figmaUrl':
        if (!value.trim()) return 'A Figma URL megadása kötelező!';
        if (!validateFigmaUrl(value.trim())) return 'Kérjük, érvényes Figma fájl URL-t adj meg!';
        break;
      case 'restApi':
        if (!value.trim()) return 'Az API kulcs megadása kötelező!';
        if (!validateApiKey(value)) return 'Az API kulcs formátuma nem megfelelő!';
        break;
    }
    return undefined;
  }, [validateFigmaUrl, validateApiKey]);

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const setError = useCallback((field: keyof FormErrors, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateForm,
    validateField,
    clearError,
    setError,
    clearAllErrors
  };
};