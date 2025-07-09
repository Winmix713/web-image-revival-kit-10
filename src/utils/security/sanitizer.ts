
import { FigmaApiResponse } from '../../types/figma';

export const sanitizeFigmaData = (data: FigmaApiResponse): FigmaApiResponse => {
  const sanitizeText = (text: string): string => {
    if (typeof text !== 'string') return text;
    
    // Remove script tags and other potentially dangerous content
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const deepSanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(deepSanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = deepSanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  return deepSanitize(data);
};
