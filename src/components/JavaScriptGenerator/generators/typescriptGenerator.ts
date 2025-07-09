
import { GenerationOptions } from '../types';

export const generateTypeScriptCode = (data: any, opts: GenerationOptions): string => {
  return `/**
 * TypeScript Figma Export
 * Generated: ${new Date().toISOString()}
 * Type-safe Figma component with full IntelliSense support
 */

// Type Definitions
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  depth: number;
  children?: FigmaNode[];
  fills?: any[];
  effects?: any[];
  style?: any;
}

interface FigmaMetadata {
  name: string;
  fileKey: string;
  lastModified: string;
  version: string;
  role: string;
  editorType: string;
  thumbnailUrl?: string;
}

interface FigmaComponentData {
  metadata: FigmaMetadata;
  structure: FigmaNode;
  components: Record<string, any>;
  styles: Record<string, any>;
}

export class FigmaComponent {
  private readonly data: FigmaComponentData;

  constructor(data: FigmaComponentData) {
    this.data = data;
  }

  public get metadata(): FigmaMetadata {
    return this.data.metadata;
  }

  public get structure(): FigmaNode {
    return this.data.structure;
  }

  public findNodeById(id: string): FigmaNode | null {
    const traverse = (node: FigmaNode): FigmaNode | null => {
      if (node.id === id) return node;
      if (node.children) {
        for (const child of node.children) {
          const result = traverse(child);
          if (result) return result;
        }
      }
      return null;
    };
    return traverse(this.structure);
  }
}

// Create and export instance
const figmaComponentData: FigmaComponentData = ${JSON.stringify(data, null, 2)};
const figmaComponent = new FigmaComponent(figmaComponentData);

export default figmaComponent;
export { type FigmaComponentData, type FigmaNode, type FigmaMetadata };`;
};
