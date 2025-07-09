
import { GenerationOptions } from '../types';

export const generateMinimalCode = (data: any, opts: GenerationOptions): string => {
  return `// Minimal Figma Export - ${data.metaData.name}
const figmaComponent = {
  name: "${data.metaData.name}",
  id: "${data.processedDocument.id}",
  type: "${data.processedDocument.type}",
  fileKey: "${data.metaData.fileKey}",
  lastModified: "${data.metaData.lastModified}",
  structure: ${JSON.stringify(data.processedDocument, null, 2)},
  
  // Essential methods
  findById: function(id) {
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
    return find(this.structure);
  },
  
  getColors: function() {
    const colors = [];
    const traverse = (node) => {
      if (node.fills) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b } = fill.color;
            const hex = '#' + [r, g, b].map(x => 
              Math.round(x * 255).toString(16).padStart(2, '0')
            ).join('');
            if (!colors.includes(hex)) colors.push(hex);
          }
        });
      }
      if (node.children) node.children.forEach(traverse);
    };
    traverse(this.structure);
    return colors;
  }
};

${opts.outputStyle === 'es6' ? 'export default figmaComponent;' : 'module.exports = figmaComponent;'}`;
};
