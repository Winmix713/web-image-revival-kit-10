import { useState, useCallback, useEffect } from 'react';

interface CacheEntry {
  code: string;
  timestamp: number;
  format: string;
  hash: string;
}

interface CacheOptions {
  maxAge?: number; // in milliseconds
  maxEntries?: number;
}

export const useCodeCache = (options: CacheOptions = {}) => {
  const { maxAge = 24 * 60 * 60 * 1000, maxEntries = 50 } = options; // 24 hours default
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('figma-code-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        const cacheMap = new Map(Object.entries(parsed));
        
        // Clean expired entries
        const now = Date.now();
        const cleaned = new Map();
        
        for (const [key, entry] of cacheMap) {
          if (now - (entry as CacheEntry).timestamp < maxAge) {
            cleaned.set(key, entry);
          }
        }
        
        setCache(cleaned);
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }, [maxAge]);

  // Save cache to localStorage
  const saveCache = useCallback((newCache: Map<string, CacheEntry>) => {
    try {
      const cacheObject = Object.fromEntries(newCache);
      localStorage.setItem('figma-code-cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }, []);

  // Generate cache key
  const generateCacheKey = useCallback((fileKey: string, format: string, dataHash: string) => {
    return `${fileKey}-${format}-${dataHash}`;
  }, []);

  // Generate hash for data
  const generateHash = useCallback((data: any): string => {
    return btoa(JSON.stringify(data)).slice(0, 16);
  }, []);

  // Get from cache
  const getFromCache = useCallback((fileKey: string, format: string, data: any): string | null => {
    const hash = generateHash(data);
    const key = generateCacheKey(fileKey, format, hash);
    const entry = cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < maxAge) {
      return entry.code;
    }
    
    return null;
  }, [cache, maxAge, generateHash, generateCacheKey]);

  // Set in cache
  const setInCache = useCallback((fileKey: string, format: string, data: any, code: string) => {
    const hash = generateHash(data);
    const key = generateCacheKey(fileKey, format, hash);
    
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      
      // Remove oldest entries if we exceed maxEntries
      if (newCache.size >= maxEntries) {
        const sortedEntries = Array.from(newCache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp);
        
        // Remove oldest 25% of entries
        const toRemove = Math.floor(maxEntries * 0.25);
        for (let i = 0; i < toRemove; i++) {
          newCache.delete(sortedEntries[i][0]);
        }
      }
      
      newCache.set(key, {
        code,
        timestamp: Date.now(),
        format,
        hash
      });
      
      saveCache(newCache);
      return newCache;
    });
  }, [maxEntries, generateHash, generateCacheKey, saveCache]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    localStorage.removeItem('figma-code-cache');
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cache.values());
    
    return {
      totalEntries: cache.size,
      validEntries: entries.filter(entry => now - entry.timestamp < maxAge).length,
      expiredEntries: entries.filter(entry => now - entry.timestamp >= maxAge).length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null,
      totalSize: JSON.stringify(Object.fromEntries(cache)).length
    };
  }, [cache, maxAge]);

  return {
    getFromCache,
    setInCache,
    clearCache,
    getCacheStats
  };
};