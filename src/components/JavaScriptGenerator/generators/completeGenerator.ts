
import { GenerationOptions } from '../types';

export const generateCompleteCode = (data: any, opts: GenerationOptions): string => {
  const timestamp = new Date().toISOString();
  const header = opts.includeComments ? `/**
 * Figma Design JavaScript Export
 * Generated: ${timestamp}
 * File: ${data.metaData.name}
 * Format: Complete Export
 * 
 * This file contains the complete digital fingerprint of your Figma component,
 * including all metadata, styling, layout, and structural information.
 */

` : '';

  const typeDefinitions = opts.includeTypes ? `// Type Definitions
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  depth: number;
  children?: FigmaNode[];
  fills?: any[];
  effects?: any[];
  style?: any;
  absoluteBoundingBox?: any;
  constraints?: any;
  characters?: string;
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

` : '';

  const helperFunctions = opts.includeHelpers ? `// Helper Functions
const figmaHelpers = {
  // Find node by ID
  findNodeById: function(node, id) {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  },

  // Traverse all nodes
  traverseNodes: function(node, callback) {
    callback(node);
    if (node.children) {
      node.children.forEach(child => this.traverseNodes(child, callback));
    }
  },

  // Extract color palette
  extractColors: function(node) {
    const colors = new Set();
    this.traverseNodes(node, (n) => {
      if (n.fills) {
        n.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b, a = 1 } = fill.color;
            const hex = '#' + [r, g, b].map(x => 
              Math.round(x * 255).toString(16).padStart(2, '0')
            ).join('');
            colors.add(hex);
          }
        });
      }
    });
    return Array.from(colors);
  },

  // Generate CSS for node
  generateCSS: function(node) {
    let css = \`/* \${node.name} */\\n\`;
    
    if (node.fills && node.fills[0] && node.fills[0].type === 'SOLID') {
      const { r, g, b, a = 1 } = node.fills[0].color;
      css += \`  background-color: rgba(\${Math.round(r*255)}, \${Math.round(g*255)}, \${Math.round(b*255)}, \${a});\\n\`;
    }
    
    if (node.effects) {
      const shadows = [];
      node.effects.forEach(effect => {
        if (effect.type === 'DROP_SHADOW') {
          const { r, g, b, a = 1 } = effect.color || { r: 0, g: 0, b: 0, a: 1 };
          const color = \`rgba(\${Math.round(r*255)}, \${Math.round(g*255)}, \${Math.round(b*255)}, \${a})\`;
          shadows.push(\`\${effect.offset?.x || 0}px \${effect.offset?.y || 0}px \${effect.radius || 0}px \${color}\`);
        }
      });
      if (shadows.length > 0) {
        css += \`  box-shadow: \${shadows.join(', ')};\\n\`;
      }
    }
    
    return css;
  }
};

` : '';

  const mainCode = `// Main Figma Component Data
const figmaData = {
  metadata: ${JSON.stringify(data.metaData, null, 2)},
  document: ${JSON.stringify(data.processedDocument, null, 2)},
  components: ${JSON.stringify(data.components, null, 2)},
  styles: ${JSON.stringify(data.styles, null, 2)}
};

`;

  const exportCode = opts.outputStyle === 'commonjs' ? `
// CommonJS Export
module.exports = figmaData;
module.exports.default = figmaData;
` : opts.outputStyle === 'umd' ? `
// UMD Export
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FigmaData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return figmaData;
}));
` : `
// ES6 Export
export default figmaData;
export { figmaData };
`;

  return `${header}${typeDefinitions}${helperFunctions}${mainCode}${exportCode}`;
};
