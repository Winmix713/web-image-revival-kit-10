
import { FigmaApiResponse, GeneratedJavaScript } from '../types/figma';
import { ParsedCSSData, CSSParser } from './cssParser';
import { extractMetadata } from './figma/metadata';
import { processNodeStructure } from './figma/nodeProcessor';
import { extractDesignTokens } from './figma/designTokens';

export interface EnhancedCodeGeneration {
  figmaData: FigmaApiResponse;
  cssData?: ParsedCSSData;
  fileKey: string;
  nodeId?: string;
}

export class EnhancedFigmaToJSGenerator {
  generateFromFigmaData(params: EnhancedCodeGeneration): GeneratedJavaScript {
    const { figmaData, cssData, fileKey, nodeId } = params;
    
    const processedData = processNodeStructure(figmaData.document);
    const metadata = extractMetadata(figmaData, fileKey, nodeId);
    const designTokens = extractDesignTokens(figmaData);
    
    const code = this.generateEnhancedJavaScriptCode({
      metadata,
      document: processedData,
      components: figmaData.components,
      styles: figmaData.styles,
      designTokens,
      cssData,
    });

    return {
      code,
      metadata: {
        fileKey,
        fileName: figmaData.name,
        nodeId,
        generatedAt: new Date().toISOString(),
        size: code.length,
      },
    };
  }

  private generateEnhancedJavaScriptCode(data: any): string {
    const timestamp = new Date().toISOString();
    const hasCSSData = data.cssData && data.cssData.rules.length > 0;
    
    return `/**
 * Enhanced Figma Design JavaScript Export
 * Generated: ${timestamp}
 * File: ${data.metadata.fileName}
 * Source: ${data.metadata.sourceURL}
 * 
 * This file contains the complete digital fingerprint of your Figma component,
 * including all metadata, styling, layout, structural information, and CSS integration.
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
  designTokens: ${JSON.stringify(data.designTokens, null, 2)}${hasCSSData ? ',' : ''}

${hasCSSData ? `
  // ===== ENHANCED CSS INTEGRATION =====
  cssData: ${JSON.stringify(data.cssData, null, 2)},
  
  // CSS-derived design system
  designSystem: {
    colors: ${JSON.stringify(data.cssData.colors)},
    fonts: ${JSON.stringify(data.cssData.fonts)},
    spacing: ${JSON.stringify(data.cssData.spacing)},
    borderRadius: ${JSON.stringify(data.cssData.borderRadius)},
    shadows: ${JSON.stringify(data.cssData.shadows)},
    animations: ${JSON.stringify(data.cssData.animations)}
  }` : ''}
};

// ===== ENHANCED HELPER FUNCTIONS =====
function extractFigmaStyles(figmaData) {
  const baseStyles = {
    name: figmaData.name,
    nodeID: figmaData.nodeID,
    type: figmaData.type,
    sourceURL: figmaData.sourceURL,
    lastModified: figmaData.lastModified,
    colors: getColorFromFills(figmaData.document.computedStyles?.fills),
    typography: figmaData.document.computedStyles?.typography,
    layout: figmaData.document.computedStyles?.layout,
    effects: figmaData.document.computedStyles?.effects
  };

${hasCSSData ? `
  // Enhanced with CSS data
  if (figmaData.cssData) {
    baseStyles.enhancedColors = figmaData.cssData.colors;
    baseStyles.cssRules = figmaData.cssData.rules;
    baseStyles.designSystem = figmaData.designSystem;
  }` : ''}

  return baseStyles;
}

${hasCSSData ? `
// ===== CSS-SPECIFIC HELPER FUNCTIONS =====
function getCSSRuleBySelector(selector) {
  return figmaData.cssData?.rules.find(rule => 
    rule.selector === selector || rule.selector.includes(selector)
  );
}

function getComponentCSS(componentName) {
  return figmaData.cssData?.rules.filter(rule => 
    rule.isComponent && rule.selector.includes(componentName.toLowerCase())
  );
}

function extractCSSProperties(selector, properties) {
  const rule = getCSSRuleBySelector(selector);
  if (!rule) return {};
  
  const result = {};
  properties.forEach(prop => {
    if (rule.properties[prop]) {
      result[prop] = rule.properties[prop];
    }
  });
  return result;
}

function generateReactStyles(selector) {
  const rule = getCSSRuleBySelector(selector);
  if (!rule) return {};
  
  const reactStyles = {};
  Object.entries(rule.properties).forEach(([prop, value]) => {
    // Convert CSS property names to camelCase for React
    const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    reactStyles[camelProp] = value;
  });
  
  return reactStyles;
}
` : ''}

function getColorFromFills(fills) {
  if (!fills || !Array.isArray(fills)) return [];
  
  return fills
    .filter(fill => fill.computedColor && fill.computedColor !== 'transparent')
    .map(fill => fill.computedColor);
}

// ===== EXPORTS =====
export { 
  figmaData, 
  extractFigmaStyles, 
  getColorFromFills${hasCSSData ? `,
  getCSSRuleBySelector,
  getComponentCSS,
  extractCSSProperties,
  generateReactStyles` : ''} 
};

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    figmaData, 
    extractFigmaStyles, 
    getColorFromFills${hasCSSData ? `,
    getCSSRuleBySelector,
    getComponentCSS,
    extractCSSProperties,
    generateReactStyles` : ''} 
  };
}`;
  }

  static parseCSS(cssText: string): ParsedCSSData {
    return CSSParser.parse(cssText);
  }
}

export const enhancedCodeGenerator = new EnhancedFigmaToJSGenerator();
