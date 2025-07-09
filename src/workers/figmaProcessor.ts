// Web Worker for background Figma data processing
import { FigmaApiResponse, FigmaNode } from '../types/figma';

export interface ProcessingTask {
  id: string;
  type: 'PROCESS_FIGMA_DATA' | 'ENHANCE_WITH_CSS' | 'GENERATE_CODE';
  data: any;
  options?: any;
}

export interface ProcessingResult {
  taskId: string;
  success: boolean;
  result?: any;
  error?: string;
  progress?: number;
}

// Types for different processing tasks
export interface FigmaProcessingTask extends ProcessingTask {
  type: 'PROCESS_FIGMA_DATA';
  data: FigmaApiResponse;
  options: {
    includeMetadata: boolean;
    processComponents: boolean;
    processStyles: boolean;
    maxDepth: number;
  };
}

export interface CSSEnhancementTask extends ProcessingTask {
  type: 'ENHANCE_WITH_CSS';
  data: {
    figmaData: FigmaApiResponse;
    cssText: string;
  };
  options: {
    strictMatching: boolean;
    enableAutoMapping: boolean;
    minConfidence: number;
  };
}

export interface CodeGenerationTask extends ProcessingTask {
  type: 'GENERATE_CODE';
  data: {
    figmaData: FigmaApiResponse;
    cssData?: any;
  };
  options: {
    outputFormat: 'javascript' | 'typescript' | 'json';
    includeComponents: boolean;
    includeStyles: boolean;
    includeDesignTokens: boolean;
  };
}

// Worker message handler
self.addEventListener('message', (event: MessageEvent<ProcessingTask>) => {
  const task = event.data;
  
  try {
    switch (task.type) {
      case 'PROCESS_FIGMA_DATA':
        handleFigmaProcessing(task as FigmaProcessingTask);
        break;
      case 'ENHANCE_WITH_CSS':
        handleCSSEnhancement(task as CSSEnhancementTask);
        break;
      case 'GENERATE_CODE':
        handleCodeGeneration(task as CodeGenerationTask);
        break;
      default:
        postMessage({
          taskId: task.id,
          success: false,
          error: `Unknown task type: ${task.type}`
        });
    }
  } catch (error) {
    postMessage({
      taskId: task.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Process large Figma files in background
async function handleFigmaProcessing(task: FigmaProcessingTask) {
  const { data, options } = task;
  
  // Send progress updates
  postMessage({
    taskId: task.id,
    success: true,
    progress: 10
  });
  
  try {
    const processedData = await processLargeFigmaFile(data, options);
    
    postMessage({
      taskId: task.id,
      success: true,
      result: processedData,
      progress: 100
    });
  } catch (error) {
    postMessage({
      taskId: task.id,
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed'
    });
  }
}

// Enhance Figma data with CSS in background
async function handleCSSEnhancement(task: CSSEnhancementTask) {
  const { data, options } = task;
  
  postMessage({
    taskId: task.id,
    success: true,
    progress: 20
  });
  
  try {
    // Import CSS enhancer dynamically to avoid bundling issues
    const { CSSEnhancer } = await import('../services/cssEnhancer');
    
    postMessage({
      taskId: task.id,
      success: true,
      progress: 50
    });
    
    const enhancementResult = CSSEnhancer.enhance(
      data.figmaData,
      data.cssText,
      options
    );
    
    postMessage({
      taskId: task.id,
      success: true,
      result: enhancementResult,
      progress: 100
    });
  } catch (error) {
    postMessage({
      taskId: task.id,
      success: false,
      error: error instanceof Error ? error.message : 'CSS enhancement failed'
    });
  }
}

// Generate code in background
async function handleCodeGeneration(task: CodeGenerationTask) {
  const { data, options } = task;
  
  postMessage({
    taskId: task.id,
    success: true,
    progress: 30
  });
  
  try {
    const generatedCode = await generateCodeInBackground(data, options);
    
    postMessage({
      taskId: task.id,
      success: true,
      result: generatedCode,
      progress: 100
    });
  } catch (error) {
    postMessage({
      taskId: task.id,
      success: false,
      error: error instanceof Error ? error.message : 'Code generation failed'
    });
  }
}

// Helper function to process large Figma files
async function processLargeFigmaFile(
  data: FigmaApiResponse,
  options: FigmaProcessingTask['options']
): Promise<any> {
  const processed = {
    ...data,
    document: await processNodeRecursively(data.document, options, 0)
  };
  
  return processed;
}

// Process nodes recursively with depth limit
async function processNodeRecursively(
  node: FigmaNode,
  options: FigmaProcessingTask['options'],
  depth: number
): Promise<FigmaNode> {
  // Respect max depth to prevent infinite recursion
  if (depth > options.maxDepth) {
    return { ...node, children: [] };
  }
  
  const processedNode = { ...node };
  
  // Process children in batches to avoid blocking
  if (node.children && node.children.length > 0) {
    const batchSize = 50;
    const processedChildren: FigmaNode[] = [];
    
    for (let i = 0; i < node.children.length; i += batchSize) {
      const batch = node.children.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(child => processNodeRecursively(child, options, depth + 1))
      );
      
      processedChildren.push(...batchResults);
      
      // Yield control to avoid blocking the worker
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    processedNode.children = processedChildren;
  }
  
  return processedNode;
}

// Generate code in background with progress updates
async function generateCodeInBackground(
  data: CodeGenerationTask['data'],
  options: CodeGenerationTask['options']
): Promise<string> {
  const { figmaData, cssData } = data;
  
  // Process in chunks to allow progress updates
  const metadata = extractMetadata(figmaData);
  const designTokens = extractDesignTokens(figmaData);
  
  // Yield control
  await new Promise(resolve => setTimeout(resolve, 0));
  
  const components = options.includeComponents ? figmaData.components : {};
  const styles = options.includeStyles ? figmaData.styles : {};
  
  // Generate the final code
  const code = generateJavaScriptCode({
    metadata,
    document: figmaData.document,
    components,
    styles,
    designTokens: options.includeDesignTokens ? designTokens : {},
    cssData
  }, options.outputFormat);
  
  return code;
}

// Helper functions (simplified versions)
function extractMetadata(figmaData: FigmaApiResponse): any {
  return {
    fileKey: figmaData.name,
    lastModified: figmaData.lastModified,
    version: figmaData.version,
    thumbnailUrl: figmaData.thumbnailUrl,
    extractedAt: new Date().toISOString()
  };
}

function extractDesignTokens(figmaData: FigmaApiResponse): any {
  const tokens = {
    colors: {},
    typography: {},
    spacing: {},
    effects: {}
  };
  
  // Extract from styles
  if (figmaData.styles) {
    Object.entries(figmaData.styles).forEach(([key, style]) => {
      switch (style.styleType) {
        case 'FILL':
          tokens.colors[key] = style;
          break;
        case 'TEXT':
          tokens.typography[key] = style;
          break;
        case 'EFFECT':
          tokens.effects[key] = style;
          break;
      }
    });
  }
  
  return tokens;
}

function generateJavaScriptCode(
  data: any,
  format: 'javascript' | 'typescript' | 'json'
): string {
  const baseCode = `
// Generated Figma JavaScript Code
// Generated at: ${new Date().toISOString()}

const figmaData = ${JSON.stringify(data, null, 2)};

// Helper functions
const getFigmaNode = (nodeId) => {
  const findNode = (node) => {
    if (node.id === nodeId) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child);
        if (found) return found;
      }
    }
    return null;
  };
  return findNode(figmaData.document);
};

const getNodesByType = (nodeType) => {
  const nodes = [];
  const traverse = (node) => {
    if (node.type === nodeType) nodes.push(node);
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  traverse(figmaData.document);
  return nodes;
};

export { figmaData, getFigmaNode, getNodesByType };
export default figmaData;
`;
  
  switch (format) {
    case 'typescript':
      return `${baseCode}
      
// TypeScript type definitions
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  // Add more types as needed
}`;
    case 'json':
      return JSON.stringify(data, null, 2);
    default:
      return baseCode;
  }
}

// Export for TypeScript
export default null;