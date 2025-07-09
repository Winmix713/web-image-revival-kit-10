// Cache Service for Figma JS Generator
import { FigmaApiResponse, GeneratedJavaScript } from '../../types/figma';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
  size: number;
  hits: number;
  lastAccessed: number;
}

export interface CacheOptions {
  expiryHours?: number;
  maxSize?: number; // in MB
  enableCompression?: boolean;
  enablePersistence?: boolean;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number; // in bytes
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
  topEntries: Array<{
    key: string;
    hits: number;
    size: number;
    lastAccessed: number;
  }>;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry>;
  private stats: {
    hits: number;
    misses: number;
    sets: number;
    evictions: number;
  };
  private maxSize: number;
  private defaultExpiryHours: number;
  private enablePersistence: boolean;
  private enableCompression: boolean;

  private constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
    this.maxSize = (options.maxSize || 100) * 1024 * 1024; // Convert MB to bytes
    this.defaultExpiryHours = options.expiryHours || 24;
    this.enablePersistence = options.enablePersistence ?? true;
    this.enableCompression = options.enableCompression ?? true;
    
    // Load persisted cache
    if (this.enablePersistence) {
      this.loadFromStorage();
    }
    
    // Set up periodic cleanup
    this.setupCleanup();
  }

  public static getInstance(options?: CacheOptions): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(options);
    }
    return CacheService.instance;
  }

  // Cache Figma API responses
  public async cacheFigmaData(
    fileKey: string,
    nodeId: string | null,
    data: FigmaApiResponse,
    options?: CacheOptions
  ): Promise<void> {
    const key = this.generateFigmaKey(fileKey, nodeId);
    await this.set(key, data, options);
  }

  public async getCachedFigmaData(
    fileKey: string,
    nodeId: string | null
  ): Promise<FigmaApiResponse | null> {
    const key = this.generateFigmaKey(fileKey, nodeId);
    return await this.get<FigmaApiResponse>(key);
  }

  // Cache generated JavaScript code
  public async cacheGeneratedCode(
    fileKey: string,
    nodeId: string | null,
    cssHash: string | null,
    code: GeneratedJavaScript,
    options?: CacheOptions
  ): Promise<void> {
    const key = this.generateCodeKey(fileKey, nodeId, cssHash);
    await this.set(key, code, options);
  }

  public async getCachedGeneratedCode(
    fileKey: string,
    nodeId: string | null,
    cssHash: string | null
  ): Promise<GeneratedJavaScript | null> {
    const key = this.generateCodeKey(fileKey, nodeId, cssHash);
    return await this.get<GeneratedJavaScript>(key);
  }

  // Cache CSS enhancement results
  public async cacheCSSEnhancement(
    figmaHash: string,
    cssHash: string,
    enhancement: any,
    options?: CacheOptions
  ): Promise<void> {
    const key = this.generateCSSEnhancementKey(figmaHash, cssHash);
    await this.set(key, enhancement, options);
  }

  public async getCachedCSSEnhancement(
    figmaHash: string,
    cssHash: string
  ): Promise<any | null> {
    const key = this.generateCSSEnhancementKey(figmaHash, cssHash);
    return await this.get(key);
  }

  // Generic cache methods
  public async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check expiry
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access stats
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    
    // Decompress if needed
    let data = entry.data;
    if (this.enableCompression && this.isCompressed(data)) {
      data = await this.decompress(data);
    }
    
    return data as T;
  }

  public async set<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    const expiryHours = options?.expiryHours || this.defaultExpiryHours;
    const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);
    
    // Compress data if enabled
    let processedData = data;
    if (this.enableCompression && this.shouldCompress(data)) {
      processedData = await this.compress(data);
    }
    
    const size = this.calculateSize(processedData);
    
    // Check if we need to evict entries
    if (this.getCurrentSize() + size > this.maxSize) {
      await this.evictOldEntries(size);
    }
    
    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: Date.now(),
      expiresAt,
      version: '1.0',
      size,
      hits: 0,
      lastAccessed: Date.now()
    };
    
    this.cache.set(key, entry);
    this.stats.sets++;
    
    // Persist to storage
    if (this.enablePersistence) {
      await this.saveToStorage();
    }
  }

  public async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted && this.enablePersistence) {
      await this.saveToStorage();
    }
    return deleted;
  }

  public async clear(): Promise<void> {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
    
    if (this.enablePersistence) {
      localStorage.removeItem('figma-js-generator-cache');
    }
  }

  public getStats(): CacheStats {
    const entries = Array.from(this.cache.entries());
    const totalSize = entries.reduce((sum, [, entry]) => sum + entry.size, 0);
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    
    const topEntries = entries
      .map(([key, entry]) => ({
        key,
        hits: entry.hits,
        size: entry.size,
        lastAccessed: entry.lastAccessed
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);
    
    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate,
      oldestEntry: Math.min(...entries.map(([, entry]) => entry.timestamp)),
      newestEntry: Math.max(...entries.map(([, entry]) => entry.timestamp)),
      topEntries
    };
  }

  // Key generation methods
  private generateFigmaKey(fileKey: string, nodeId: string | null): string {
    return `figma:${fileKey}:${nodeId || 'root'}`;
  }

  private generateCodeKey(
    fileKey: string,
    nodeId: string | null,
    cssHash: string | null
  ): string {
    return `code:${fileKey}:${nodeId || 'root'}:${cssHash || 'nocss'}`;
  }

  private generateCSSEnhancementKey(figmaHash: string, cssHash: string): string {
    return `css:${figmaHash}:${cssHash}`;
  }

  // Utility methods
  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private getCurrentSize(): number {
    return Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
  }

  private async evictOldEntries(requiredSize: number): Promise<void> {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (least recently used first)
    entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    let freedSpace = 0;
    for (const [key, entry] of entries) {
      if (freedSpace >= requiredSize) break;
      
      this.cache.delete(key);
      freedSpace += entry.size;
      this.stats.evictions++;
    }
  }

  private shouldCompress(data: any): boolean {
    const size = this.calculateSize(data);
    return size > 1024; // Compress if larger than 1KB
  }

  private isCompressed(data: any): boolean {
    return typeof data === 'string' && data.startsWith('COMPRESSED:');
  }

  private async compress(data: any): Promise<string> {
    // Simple compression using native compression APIs
    const jsonString = JSON.stringify(data);
    
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(jsonString));
      writer.close();
      
      const compressed = await reader.read();
      const base64 = btoa(String.fromCharCode(...compressed.value));
      return `COMPRESSED:${base64}`;
    }
    
    // Fallback to simple string compression
    return `COMPRESSED:${btoa(jsonString)}`;
  }

  private async decompress(compressedData: string): Promise<any> {
    const data = compressedData.replace('COMPRESSED:', '');
    
    if ('DecompressionStream' in window) {
      try {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0))));
        writer.close();
        
        const decompressed = await reader.read();
        const jsonString = new TextDecoder().decode(decompressed.value);
        return JSON.parse(jsonString);
      } catch (error) {
        console.warn('Decompression failed, falling back to base64 decode');
      }
    }
    
    // Fallback to simple base64 decode
    const jsonString = atob(data);
    return JSON.parse(jsonString);
  }

  private async saveToStorage(): Promise<void> {
    try {
      const cacheData = {
        cache: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: Date.now()
      };
      
      localStorage.setItem('figma-js-generator-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('figma-js-generator-cache');
      if (!stored) return;
      
      const cacheData = JSON.parse(stored);
      
      // Restore cache entries
      this.cache = new Map(cacheData.cache);
      this.stats = cacheData.stats || this.stats;
      
      // Clean up expired entries
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private setupCleanup(): void {
    // Clean up expired entries every hour
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Utility functions for hashing
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

export function hashObject(obj: any): string {
  return hashString(JSON.stringify(obj));
}

// Export singleton instance
export const cacheService = CacheService.getInstance();