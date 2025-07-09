
import { GenerationOptions } from '../types';

export const generateStructuredCode = (data: any, opts: GenerationOptions): string => {
  return `/**
 * Structured Figma Component Export
 * Component: ${data.metaData.name}
 */

class FigmaComponent {
  constructor() {
    this.metadata = ${JSON.stringify(data.metaData, null, 4)};
    this.structure = ${JSON.stringify(data.processedDocument, null, 4)};
    this.components = ${JSON.stringify(data.components, null, 4)};
    this.styles = ${JSON.stringify(data.styles, null, 4)};
  }

  // Get component metadata
  getMetadata() {
    return this.metadata;
  }

  // Get component structure
  getStructure() {
    return this.structure;
  }

  // Find nodes by type
  findNodesByType(type) {
    const results = [];
    const traverse = (node) => {
      if (node.type === type) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(this.structure);
    return results;
  }

  // Find node by ID
  findNodeById(id) {
    const traverse = (node) => {
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

// Create instance
const figmaComponent = new FigmaComponent();

// Export
${opts.outputStyle === 'es6' ? 'export default figmaComponent;\nexport { FigmaComponent };' : 'module.exports = figmaComponent;\nmodule.exports.FigmaComponent = FigmaComponent;'}`;
};
