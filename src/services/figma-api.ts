import { FigmaApiResponse, FigmaNode } from '../types/figma';

export class FigmaApiService {
  private baseUrl = 'https://api.figma.com/v1';

  async fetchFigmaFile(fileKey: string, token: string, nodeId?: string): Promise<FigmaApiResponse> {
    try {
      const url = nodeId 
        ? `${this.baseUrl}/files/${fileKey}/nodes?ids=${nodeId}`
        : `${this.baseUrl}/files/${fileKey}`;

      const response = await fetch(url, {
        headers: {
          'X-Figma-Token': token,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Invalid Figma token or insufficient permissions');
        }
        if (response.status === 404) {
          throw new Error('Figma file not found or not accessible');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later');
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (nodeId) {
        // Handle node-specific response
        const nodeData = data.nodes[nodeId];
        if (!nodeData) {
          throw new Error(`Node ${nodeId} not found in file`);
        }

        return {
          document: nodeData.document,
          components: data.components || {},
          styles: data.styles || {},
          name: nodeData.document.name,
          lastModified: data.lastModified,
          thumbnailUrl: data.thumbnailUrl,
          version: data.version,
          role: data.role,
          editorType: data.editorType,
        };
      }

      return {
        document: data.document,
        components: data.components || {},
        styles: data.styles || {},
        name: data.name,
        lastModified: data.lastModified,
        thumbnailUrl: data.thumbnailUrl,
        version: data.version,
        role: data.role,
        editorType: data.editorType,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch Figma data');
    }
  }

  extractFileKeyFromUrl(url: string): string | null {
    const patterns = [
      /figma\.com\/file\/([a-zA-Z0-9]+)/,
      /figma\.com\/design\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  extractNodeIdFromUrl(url: string): string | null {
    const match = url.match(/node-id=([^&]+)/);
    return match ? decodeURIComponent(match[1]).replace(/-/g, ':') : null;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'X-Figma-Token': token,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const figmaApi = new FigmaApiService();