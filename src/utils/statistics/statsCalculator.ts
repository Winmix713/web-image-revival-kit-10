
import { GeneratedCode, ExportStats } from '../types';

export const calculateStats = (structure: GeneratedCode): ExportStats => {
  let componentsCount = 0;
  let textNodesCount = 0;
  let maxDepth = 0;
  const colors = new Set<string>();
  const fonts = new Set<string>();

  const traverse = (node: any, depth = 0) => {
    if (!node) return;

    maxDepth = Math.max(maxDepth, depth);

    if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      componentsCount++;
    }

    if (node.type === 'TEXT') {
      textNodesCount++;
      if (node.style?.fontFamily) {
        fonts.add(node.style.fontFamily);
      }
    }

    // Extract colors
    if (node.fills) {
      node.fills.forEach((fill: any) => {
        if (fill.type === 'SOLID' && fill.color) {
          const { r, g, b } = fill.color;
          const hex = `#${[r, g, b].map(x => 
            Math.round(x * 255).toString(16).padStart(2, '0')
          ).join('')}`;
          colors.add(hex);
        }
      });
    }

    if (node.children) {
      node.children.forEach((child: any) => traverse(child, depth + 1));
    }
  };

  if (structure.mainComponent) {
    traverse(structure.mainComponent);
  }

  // Add external components
  if (structure.externalElements?.components) {
    componentsCount += Object.keys(structure.externalElements.components).length;
  }

  const totalNodes = countNodes(structure.mainComponent);
  const complexity = calculateComplexity(totalNodes, maxDepth, componentsCount);
  const estimatedFileSize = JSON.stringify(structure).length;

  return {
    componentsCount,
    textNodesCount,
    colorsUsed: colors.size,
    complexity,
    estimatedFileSize,
    maxDepth,
    uniqueFonts: fonts.size
  };
};

const countNodes = (node: any): number => {
  if (!node) return 0;
  let count = 1;
  if (node.children) {
    count += node.children.reduce((sum: number, child: any) => sum + countNodes(child), 0);
  }
  return count;
};

const calculateComplexity = (nodeCount: number, maxDepth: number, componentCount: number): 'low' | 'medium' | 'high' => {
  const score = nodeCount + (maxDepth * 2) + (componentCount * 3);
  
  if (score < 30) return 'low';
  if (score < 80) return 'medium';
  return 'high';
};
