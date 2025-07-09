// Enhanced Figma API Service
import { FigmaApiResponse, FigmaNode } from '../../types/figma';
import { cacheService, hashString } from '../cache/cacheService';
import { useUserPreferences } from '../../store/userPreferences';

export interface FigmaApiOptions {
  enableCaching?: boolean;
  cacheExpiryHours?: number;
  maxRetries?: number;
  retryDelay?: number;
  enableBackgroundProcessing?: boolean;
}

export interface FigmaApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
}

export interface FigmaApiStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

export class FigmaApiService {
  private static instance: FigmaApiService;
  private baseUrl = 'https://api.figma.com/v1';
  private stats: FigmaApiStats;
  private requestQueue: Map<string, Promise<FigmaApiResponse>>;

  private constructor() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      lastRequestTime: 0
    };
    this.requestQueue = new Map();
  }

  public static getInstance(): FigmaApiService {
    if (!FigmaApiService.instance) {
      FigmaApiService.instance = new FigmaApiService();
    }
    return FigmaApiService.instance;
  }

  public async fetchFigmaFile(
    fileKey: string,
    token: string,
    nodeId?: string,
    options: FigmaApiOptions = {}
  ): Promise<FigmaApiResponse> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(fileKey, nodeId);
    
    // Check if request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    // Check cache first
    if (options.enableCaching !== false) {
      const cached = await cacheService.getCachedFigmaData(fileKey, nodeId || null);
      if (cached) {
        this.stats.cacheHits++;
        this.updateStats(startTime, true);
        return cached;
      }
      this.stats.cacheMisses++;
    }

    // Create the request promise
    const requestPromise = this.executeRequest(fileKey, token, nodeId, options);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache the result
      if (options.enableCaching !== false) {
        await cacheService.cacheFigmaData(fileKey, nodeId || null, result, {
          expiryHours: options.cacheExpiryHours || 24
        });
      }
      
      this.updateStats(startTime, true);
      return result;
    } catch (error) {
      this.updateStats(startTime, false);
      throw error;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  private async executeRequest(
    fileKey: string,
    token: string,
    nodeId?: string,
    options: FigmaApiOptions = {}
  ): Promise<FigmaApiResponse> {
    const url = nodeId
      ? `${this.baseUrl}/files/${fileKey}/nodes?ids=${nodeId}`
      : `${this.baseUrl}/files/${fileKey}`;

    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'X-Figma-Token': token,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
          const error = await this.handleApiError(response);
          
          // Don't retry on client errors (4xx) except 429 (rate limit)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw error;
          }
          
          // Retry on server errors (5xx) and rate limits
          if (attempt < maxRetries) {
            await this.delay(retryDelay * Math.pow(2, attempt - 1)); // Exponential backoff
            continue;
          }
          
          throw error;
        }

        const data = await response.json();
        
        // Validate response structure
        if (!this.validateFigmaResponse(data)) {
          throw new Error('Invalid Figma API response structure');
        }

        return data;
      } catch (error) {
        if (attempt === maxRetries) {
          throw this.createFigmaApiError(
            'REQUEST_FAILED',
            `Failed to fetch Figma file after ${maxRetries} attempts`,
            500,
            error
          );
        }
        
        // Don't retry on network errors that aren't timeouts
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw this.createFigmaApiError(
            'NETWORK_ERROR',
            'Network error while fetching Figma file',
            0,
            error
          );
        }
        
        await this.delay(retryDelay * Math.pow(2, attempt - 1));
      }
    }

    throw new Error('Unexpected error in executeRequest');
  }

  public async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'X-Figma-Token': token,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  public extractFileKeyFromUrl(url: string): string | null {
    const patterns = [
      /figma\.com\/file\/([a-zA-Z0-9]+)/,
      /figma\.com\/design\/([a-zA-Z0-9]+)/,
      /figma\.com\/proto\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  public extractNodeIdFromUrl(url: string): string | null {
    const match = url.match(/node-id=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  public async fetchFileMetadata(
    fileKey: string,
    token: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (!response.ok) {
      throw await this.handleApiError(response);
    }

    return response.json();
  }

  public async fetchFileComponents(
    fileKey: string,
    token: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/files/${fileKey}/components`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (!response.ok) {
      throw await this.handleApiError(response);
    }

    return response.json();
  }

  public async fetchFileStyles(
    fileKey: string,
    token: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/files/${fileKey}/styles`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (!response.ok) {
      throw await this.handleApiError(response);
    }

    return response.json();
  }

  public getStats(): FigmaApiStats {
    return { ...this.stats };
  }

  public resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      lastRequestTime: 0
    };
  }

  // Helper methods
  private generateCacheKey(fileKey: string, nodeId?: string): string {
    return `${fileKey}:${nodeId || 'root'}`;
  }

  private async handleApiError(response: Response): Promise<FigmaApiError> {
    let details;
    try {
      details = await response.json();
    } catch {
      details = { message: response.statusText };
    }

    const errorCode = this.getErrorCode(response.status);
    const errorMessage = this.getErrorMessage(response.status, details);

    return this.createFigmaApiError(errorCode, errorMessage, response.status, details);
  }

  private createFigmaApiError(
    code: string,
    message: string,
    status: number,
    details?: any
  ): FigmaApiError {
    return {
      code,
      message,
      status,
      details
    };
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 429:
        return 'RATE_LIMITED';
      case 500:
        return 'INTERNAL_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  private getErrorMessage(status: number, details?: any): string {
    const defaultMessage = details?.message || 'An error occurred';
    
    switch (status) {
      case 400:
        return `Bad request: ${defaultMessage}`;
      case 401:
        return 'Invalid or missing Figma token';
      case 403:
        return 'Access denied. Check your token permissions.';
      case 404:
        return 'File not found or not accessible';
      case 429:
        return 'Rate limit exceeded. Please try again later.';
      case 500:
        return 'Figma API server error. Please try again later.';
      default:
        return defaultMessage;
    }
  }

  private validateFigmaResponse(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check for required fields
    if (!data.document || !data.document.id) {
      return false;
    }

    return true;
  }

  private updateStats(startTime: number, success: boolean): void {
    this.stats.totalRequests++;
    this.stats.lastRequestTime = Date.now();
    
    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    const responseTime = performance.now() - startTime;
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) / 
      this.stats.totalRequests;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const figmaApiService = FigmaApiService.getInstance();