
export interface GenerationOptions {
  format: 'complete' | 'minimal' | 'structured' | 'modular' | 'typescript' | 'react' | 'vue' | 'css' | 'scss' | 'tailwind';
  includeTypes: boolean;
  includeComments: boolean;
  includeValidation: boolean;
  includeHelpers: boolean;
  includeDesignTokens: boolean;
  compressionLevel: 'none' | 'basic' | 'aggressive';
  outputStyle: 'es6' | 'commonjs' | 'umd';
  treeshaking: boolean;
  minify: boolean;
}

export interface ProcessedNode {
  id: string;
  name: string;
  type: string;
  depth: number;
  fills?: any[];
  effects?: any[];
  absoluteBoundingBox?: any;
  constraints?: any;
  characters?: string;
  style?: any;
  children?: ProcessedNode[];
}

export interface ComponentStatistics {
  totalNodes: number;
  textNodes: number;
  componentInstances: number;
  components: number;
  maxDepth: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ProcessedFigmaData {
  metaData: {
    fileKey: string;
    name: string;
    lastModified: string;
    version: string;
    role: string;
    editorType: string;
    thumbnailUrl?: string;
  };
  processedDocument: ProcessedNode;
  components: Record<string, any>;
  styles: Record<string, any>;
}
