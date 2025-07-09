import { UserPreferences } from '../store/userPreferences';

export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url?: string;
  last_modified: string;
  version: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

export interface FigmaApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  scale: number;
  use_absolute_bounds?: boolean;
}

class RetryError extends Error {
  constructor(message: string, public attempt: number, public maxRetries: number) {
    super(message);
    this.name = 'RetryError';
  }
}

class FigmaApiService {
  private baseUrl = 'https://api.figma.com/v1';
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    baseDelay: number
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw new RetryError(
            `Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`,
            attempt,
            maxRetries
          );
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }

  private async makeRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<FigmaApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-Figma-Token': token,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 403) {
        throw new Error('Invalid API token or insufficient permissions.');
      }
      if (response.status === 404) {
        throw new Error('File not found or not accessible.');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data,
      status: response.status
    };
  }

  async getFile(fileKey: string, token: string, preferences: UserPreferences): Promise<FigmaFile> {
    return this.retryWithBackoff(
      async () => {
        const response = await this.makeRequest<any>(`/files/${fileKey}`, token);
        return {
          key: fileKey,
          name: response.data.name,
          thumbnail_url: response.data.thumbnailUrl,
          last_modified: response.data.lastModified,
          version: response.data.version
        };
      },
      preferences.maxRetries,
      preferences.retryDelay
    );
  }

  async getFileNodes(fileKey: string, nodeIds: string[], token: string, preferences: UserPreferences): Promise<FigmaNode[]> {
    return this.retryWithBackoff(
      async () => {
        const idsParam = nodeIds.join(',');
        const response = await this.makeRequest<any>(`/files/${fileKey}/nodes?ids=${idsParam}`, token);
        
        return Object.values(response.data.nodes).map((node: any) => ({
          id: node.document.id,
          name: node.document.name,
          type: node.document.type,
          children: node.document.children || []
        }));
      },
      preferences.maxRetries,
      preferences.retryDelay
    );
  }

  async exportImages(
    fileKey: string, 
    nodeIds: string[], 
    token: string, 
    options: ExportOptions,
    preferences: UserPreferences,
    onProgress?: (progress: number) => void
  ): Promise<{ [nodeId: string]: string }> {
    return this.retryWithBackoff(
      async () => {
        const params = new URLSearchParams({
          ids: nodeIds.join(','),
          format: options.format,
          scale: options.scale.toString(),
          ...(options.use_absolute_bounds && { use_absolute_bounds: 'true' })
        });

        onProgress?.(25);
        
        const response = await this.makeRequest<any>(
          `/images/${fileKey}?${params.toString()}`,
          token
        );

        onProgress?.(75);

        // Simulate processing time for demo
        await this.delay(1000);
        
        onProgress?.(100);
        
        return response.data.images;
      },
      preferences.maxRetries,
      preferences.retryDelay
    );
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<any>('/me', token);
      return response.status === 200;
    } catch {
      return false;
    }
  }

  extractFileKeyFromUrl(url: string): string | null {
    const patterns = [
      /figma\.com\/file\/([a-zA-Z0-9]+)/,
      /figma\.com\/design\/([a-zA-Z0-9]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}

export const figmaApiService = new FigmaApiService();