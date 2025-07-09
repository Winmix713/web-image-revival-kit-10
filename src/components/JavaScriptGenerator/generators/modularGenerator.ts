
import { GenerationOptions } from '../types';

export const generateModularCode = (data: any, opts: GenerationOptions): string => {
  return `// Modular Figma Export - ${data.metaData.name}
// Optimized for tree-shaking and modular imports

// Core module
export const figmaCore = {
  metadata: ${JSON.stringify(data.metaData, null, 2)},
  version: '2.0.0',
  format: 'modular'
};

// Component module
export const figmaComponent = {
  structure: ${JSON.stringify(data.processedDocument, null, 2)},
  
  getById: (id) => {
    const find = (node) => {
      if (node.id === id) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = find(child);
          if (found) return found;
        }
      }
      return null;
    };
    return find(figmaComponent.structure);
  }
};

// Utilities module
export const figmaUtils = {
  extractColors: () => {
    const colors = new Set();
    const traverse = (node) => {
      if (node.fills) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b } = fill.color;
            const hex = '#' + [r, g, b].map(x => 
              Math.round(x * 255).toString(16).padStart(2, '0')
            ).join('');
            colors.add(hex);
          }
        });
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(figmaComponent.structure);
    return Array.from(colors);
  }
};`;
};
