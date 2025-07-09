
import { FigmaApiResponse } from '../../../types/figma';
import { ProcessedNode, ComponentStatistics } from '../types';

export const processNodeStructure = (figmaData: FigmaApiResponse, fileKey: string) => {
  if (!figmaData?.document) return null;

  const processNode = (node: any, depth = 0): ProcessedNode => {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      depth,
      fills: node.fills,
      effects: node.effects,
      absoluteBoundingBox: node.absoluteBoundingBox,
      constraints: node.constraints,
      characters: node.characters,
      style: node.style,
      children: node.children?.map((child: any) => processNode(child, depth + 1)) || []
    };
  };

  return {
    metaData: {
      fileKey,
      name: figmaData.name,
      lastModified: figmaData.lastModified,
      version: figmaData.version,
      role: figmaData.role,
      editorType: figmaData.editorType,
      thumbnailUrl: figmaData.thumbnailUrl
    },
    processedDocument: processNode(figmaData.document),
    components: figmaData.components || {},
    styles: figmaData.styles || {}
  };
};

export const calculateStatistics = (processedDocument: ProcessedNode): ComponentStatistics => {
  let nodeCount = 0;
  let textNodes = 0;
  let componentInstances = 0;
  let components = 0;
  let maxDepth = 0;

  const traverse = (node: ProcessedNode, depth = 0) => {
    nodeCount++;
    maxDepth = Math.max(maxDepth, depth);

    if (node.type === 'TEXT') textNodes++;
    if (node.type === 'INSTANCE') componentInstances++;
    if (node.type === 'COMPONENT') components++;

    node.children?.forEach(child => traverse(child, depth + 1));
  };

  traverse(processedDocument);

  return {
    totalNodes: nodeCount,
    textNodes,
    componentInstances,
    components,
    maxDepth,
    complexity: nodeCount > 50 ? 'high' : nodeCount > 20 ? 'medium' : 'low'
  };
};
