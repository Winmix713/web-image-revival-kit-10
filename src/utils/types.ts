
export interface GeneratedCode {
  metaData: any;
  mainComponent: any;
  childrenComponents: any[];
  externalElements: any;
  extractFunction: string;
}

export interface ProcessingError {
  type: 'VALIDATION' | 'PROCESSING' | 'GENERATION';
  message: string;
  nodeId?: string;
  stack?: string;
}

export interface ExportStats {
  componentsCount: number;
  textNodesCount: number;
  colorsUsed: number;
  complexity: 'low' | 'medium' | 'high';
  estimatedFileSize: number;
  maxDepth: number;
  uniqueFonts: number;
}
