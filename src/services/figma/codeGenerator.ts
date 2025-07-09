
export const generateJavaScriptCode = (data: any): string => {
  const timestamp = new Date().toISOString();
  
  return `/**
 * Figma Design JavaScript Export
 * Generated: ${timestamp}
 * File: ${data.metadata.fileName}
 * Source: ${data.metadata.sourceURL}
 * 
 * This file contains the complete digital fingerprint of your Figma component,
 * including all metadata, styling, layout, and structural information.
 */

// ===== METADATA AND GENERAL INFORMATION =====
const figmaData = {
  // File metadata
  fileKey: "${data.metadata.fileKey}",
  fileName: "${data.metadata.fileName}",
  lastModified: "${data.metadata.lastModified}",
  thumbnailUrl: ${data.metadata.thumbnailUrl ? `"${data.metadata.thumbnailUrl}"` : 'null'},
  
  // Node information
  nodeID: "${data.metadata.nodeID}",
  name: "${data.metadata.name}",
  type: "${data.metadata.type}",
  sourceURL: "${data.metadata.sourceURL}",
  
  // Version information
  version: "${data.metadata.version}",
  role: "${data.metadata.role}",
  editorType: "${data.metadata.editorType}",

  // ===== MAIN COMPONENT STRUCTURE =====
  document: ${JSON.stringify(data.document, null, 2)},

  // ===== EXTERNAL COMPONENTS AND STYLES =====
  components: ${JSON.stringify(data.components, null, 2)},
  styles: ${JSON.stringify(data.styles, null, 2)},

  // ===== DESIGN TOKENS =====
  designTokens: ${JSON.stringify(data.designTokens, null, 2)}
};

// ===== HELPER FUNCTIONS =====
function extractFigmaStyles(figmaData) {
  return {
    name: figmaData.name,
    nodeID: figmaData.nodeID,
    type: figmaData.type,
    sourceURL: figmaData.sourceURL,
    lastModified: figmaData.lastModified,
    colors: getColorFromFills(figmaData.document.computedStyles.fills),
    typography: figmaData.document.computedStyles.typography,
    layout: figmaData.document.computedStyles.layout,
    effects: figmaData.document.computedStyles.effects
  };
}

function getColorFromFills(fills) {
  if (!fills || !Array.isArray(fills)) return [];
  
  return fills
    .filter(fill => fill.computedColor && fill.computedColor !== 'transparent')
    .map(fill => fill.computedColor);
}

// ===== EXPORTS =====
export { figmaData, extractFigmaStyles, getColorFromFills };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { figmaData, extractFigmaStyles, getColorFromFills };
}`;
};
