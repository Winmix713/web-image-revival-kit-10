import { FigmaApiResponse, FigmaNode } from '../types/figma';
import { CSSParser, CSSParseResult, CSSRule, CSSProperty } from './cssParser';

export interface EnhancementOptions {
  strictMatching: boolean;
  ignoreColors: boolean;
  ignoreTypography: boolean;
  ignoreSpacing: boolean;
  enableAutoMapping: boolean;
  mappingStrategy: 'name' | 'class' | 'id' | 'hybrid';
  minConfidence: number;
  maxSuggestions: number;
}

export interface NodeCSSMapping {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  cssRules: CSSRule[];
  confidence: number;
  mappingMethod: 'name' | 'class' | 'id' | 'auto' | 'manual';
  conflicts?: StyleConflict[];
}

export interface StyleConflict {
  type: 'color' | 'typography' | 'spacing' | 'layout' | 'effects';
  property: string;
  figmaValue: string;
  cssValue: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

export interface CSSEnhancementResult {
  enhancedCode: string;
  mappingResults: NodeCSSMapping[];
  coverage: number;
  conflicts: StyleConflict[];
  suggestions: string[];
  statistics: {
    totalNodes: number;
    mappedNodes: number;
    cssRules: number;
    conflicts: number;
    processingTime: number;
  };
}

export class CSSEnhancer {
  static enhance(
    figmaData: FigmaApiResponse,
    cssText: string,
    options: EnhancementOptions = {
      strictMatching: false,
      ignoreColors: false,
      ignoreTypography: false,
      ignoreSpacing: false,
      enableAutoMapping: true,
      mappingStrategy: 'hybrid',
      minConfidence: 0.5,
      maxSuggestions: 10
    }
  ): CSSEnhancementResult {
    const startTime = performance.now();
    
    const cssParseResult = CSSParser.parse(cssText);
    
    if (!cssParseResult.isValid) {
      throw new Error('CSS parsing failed');
    }

    const mappingResults = this.createNodeMappings(figmaData.document, cssParseResult.rules, options);
    const conflicts = this.detectConflicts(mappingResults, figmaData.document, options);
    const enhancedCode = this.generateEnhancedCode(figmaData, mappingResults, conflicts, options);
    
    const processingTime = performance.now() - startTime;
    
    return {
      enhancedCode,
      mappingResults,
      coverage: mappingResults.length / this.getAllNodes(figmaData.document).length,
      conflicts,
      suggestions: this.generateSuggestions(mappingResults, conflicts, options),
      statistics: {
        totalNodes: this.getAllNodes(figmaData.document).length,
        mappedNodes: mappingResults.length,
        cssRules: cssParseResult.rules.length,
        conflicts: conflicts.length,
        processingTime
      }
    };
  }

  private static createNodeMappings(
    document: FigmaNode, 
    cssRules: CSSRule[], 
    options: EnhancementOptions
  ): NodeCSSMapping[] {
    const mappings: NodeCSSMapping[] = [];
    const allNodes = this.getAllNodes(document);

    allNodes.forEach(node => {
      const matchingRules = this.findMatchingCSSRules(node, cssRules, options);
      
      if (matchingRules.length > 0) {
        const confidence = this.calculateMappingConfidence(node, matchingRules, options);
        
        if (confidence >= options.minConfidence) {
          mappings.push({
            nodeId: node.id,
            nodeName: node.name,
            nodeType: node.type,
            cssRules: matchingRules,
            confidence,
            mappingMethod: this.determineMappingMethod(node, matchingRules, options)
          });
        }
      }
    });

    return mappings;
  }

  private static findMatchingCSSRules(
    node: FigmaNode, 
    cssRules: CSSRule[], 
    options: EnhancementOptions
  ): CSSRule[] {
    const matchingRules: CSSRule[] = [];

    cssRules.forEach(rule => {
      const matchScore = this.calculateRuleMatchScore(node, rule, options);
      if (matchScore > 0) {
        matchingRules.push(rule);
      }
    });

    return matchingRules.sort((a, b) => 
      this.calculateRuleMatchScore(node, b, options) - 
      this.calculateRuleMatchScore(node, a, options)
    );
  }

  private static calculateRuleMatchScore(
    node: FigmaNode, 
    rule: CSSRule, 
    options: EnhancementOptions
  ): number {
    let score = 0;
    const selector = rule.selector.toLowerCase();
    const nodeName = node.name.toLowerCase();

    switch (options.mappingStrategy) {
      case 'name':
        score += this.calculateNameMatchScore(nodeName, selector);
        break;
      case 'class':
        score += this.calculateClassMatchScore(nodeName, selector);
        break;
      case 'id':
        score += this.calculateIdMatchScore(nodeName, selector);
        break;
      case 'hybrid':
        score += this.calculateNameMatchScore(nodeName, selector) * 0.4;
        score += this.calculateClassMatchScore(nodeName, selector) * 0.4;
        score += this.calculateIdMatchScore(nodeName, selector) * 0.2;
        break;
    }

    // Style similarity bonus
    if (node.fills && rule.properties) {
      score += this.calculateStyleSimilarityScore(node, rule, options);
    }

    return score;
  }

  private static calculateNameMatchScore(nodeName: string, selector: string): number {
    const nameWords = nodeName.split(/[-_\s]+/);
    const selectorWords = selector.split(/[-_\s.#]+/);
    
    let matches = 0;
    nameWords.forEach(nameWord => {
      if (selectorWords.some(selWord => selWord.includes(nameWord) || nameWord.includes(selWord))) {
        matches++;
      }
    });
    
    return matches / Math.max(nameWords.length, selectorWords.length);
  }

  private static calculateClassMatchScore(nodeName: string, selector: string): number {
    const classSelectors = selector.match(/\.[a-zA-Z][a-zA-Z0-9-_]*/g) || [];
    const nameWords = nodeName.split(/[-_\s]+/);
    
    let matches = 0;
    classSelectors.forEach(className => {
      const cleanClass = className.substring(1); // Remove the dot
      if (nameWords.some(word => cleanClass.includes(word) || word.includes(cleanClass))) {
        matches++;
      }
    });
    
    return matches / Math.max(classSelectors.length, nameWords.length);
  }

  private static calculateIdMatchScore(nodeName: string, selector: string): number {
    const idSelectors = selector.match(/#[a-zA-Z][a-zA-Z0-9-_]*/g) || [];
    const nameWords = nodeName.split(/[-_\s]+/);
    
    let matches = 0;
    idSelectors.forEach(idName => {
      const cleanId = idName.substring(1); // Remove the hash
      if (nameWords.some(word => cleanId.includes(word) || word.includes(cleanId))) {
        matches++;
      }
    });
    
    return matches / Math.max(idSelectors.length, nameWords.length);
  }

  private static calculateStyleSimilarityScore(
    node: FigmaNode, 
    rule: CSSRule, 
    options: EnhancementOptions
  ): number {
    let score = 0;
    let totalChecks = 0;

    // Check color similarity
    if (!options.ignoreColors && node.fills && Array.isArray(node.fills)) {
      const colorProps = rule.properties.filter(prop => 
        prop.property.includes('color') || prop.property.includes('background')
      );
      
      colorProps.forEach(prop => {
        totalChecks++;
        const figmaColor = this.extractFigmaColor(node.fills);
        const cssColor = this.extractCSSColor(prop.value);
        if (this.areColorssimilar(figmaColor, cssColor)) {
          score += 0.3;
        }
      });
    }

    // Check typography similarity
    if (!options.ignoreTypography && node.style) {
      const typographyProps = rule.properties.filter(prop => 
        ['font-size', 'font-weight', 'font-family', 'line-height'].includes(prop.property)
      );
      
      typographyProps.forEach(prop => {
        totalChecks++;
        if (this.isTypographySimilar(node.style, prop)) {
          score += 0.2;
        }
      });
    }

    // Check spacing similarity
    if (!options.ignoreSpacing && node.absoluteBoundingBox) {
      const spacingProps = rule.properties.filter(prop => 
        ['margin', 'padding', 'gap', 'width', 'height'].includes(prop.property)
      );
      
      spacingProps.forEach(prop => {
        totalChecks++;
        if (this.isSpacingSimilar(node.absoluteBoundingBox, prop)) {
          score += 0.1;
        }
      });
    }

    return totalChecks > 0 ? score / totalChecks : 0;
  }

  private static calculateMappingConfidence(
    node: FigmaNode, 
    rules: CSSRule[], 
    options: EnhancementOptions
  ): number {
    const avgScore = rules.reduce((sum, rule) => 
      sum + this.calculateRuleMatchScore(node, rule, options), 0
    ) / rules.length;
    
    // Apply confidence modifiers
    let confidence = avgScore;
    
    // Boost confidence for exact name matches
    if (rules.some(rule => rule.selector.toLowerCase().includes(node.name.toLowerCase()))) {
      confidence *= 1.2;
    }
    
    // Reduce confidence for generic selectors
    if (rules.some(rule => ['div', 'span', 'p', 'h1', 'h2', 'h3'].includes(rule.selector))) {
      confidence *= 0.8;
    }
    
    return Math.min(confidence, 1.0);
  }

  private static determineMappingMethod(
    node: FigmaNode, 
    rules: CSSRule[], 
    options: EnhancementOptions
  ): NodeCSSMapping['mappingMethod'] {
    const selector = rules[0]?.selector || '';
    
    if (selector.includes('#')) return 'id';
    if (selector.includes('.')) return 'class';
    if (selector.toLowerCase().includes(node.name.toLowerCase())) return 'name';
    if (options.enableAutoMapping) return 'auto';
    
    return 'manual';
  }

  private static detectConflicts(
    mappings: NodeCSSMapping[], 
    document: FigmaNode, 
    options: EnhancementOptions
  ): StyleConflict[] {
    const conflicts: StyleConflict[] = [];
    const allNodes = this.getAllNodes(document);
    
    mappings.forEach(mapping => {
      const node = allNodes.find(n => n.id === mapping.nodeId);
      if (!node) return;
      
      mapping.cssRules.forEach(rule => {
        rule.properties.forEach(prop => {
          const conflict = this.detectPropertyConflict(node, prop, options);
          if (conflict) {
            conflicts.push(conflict);
          }
        });
      });
    });
    
    return conflicts;
  }

  private static detectPropertyConflict(
    node: FigmaNode, 
    prop: CSSProperty, 
    options: EnhancementOptions
  ): StyleConflict | null {
    // Color conflicts
    if (prop.property.includes('color') && node.fills && !options.ignoreColors) {
      const figmaColor = this.extractFigmaColor(node.fills);
      const cssColor = this.extractCSSColor(prop.value);
      
      if (figmaColor && cssColor && !this.areColorsEqual(figmaColor, cssColor)) {
        return {
          type: 'color',
          property: prop.property,
          figmaValue: figmaColor,
          cssValue: cssColor,
          severity: this.getConflictSeverity(figmaColor, cssColor),
          suggestion: `Consider using Figma color: ${figmaColor}`
        };
      }
    }
    
    // Typography conflicts
    if (['font-size', 'font-weight', 'font-family'].includes(prop.property) && 
        node.style && !options.ignoreTypography) {
      const figmaValue = this.extractFigmaTypography(node.style, prop.property);
      const cssValue = prop.value;
      
      if (figmaValue && cssValue !== figmaValue) {
        return {
          type: 'typography',
          property: prop.property,
          figmaValue,
          cssValue,
          severity: 'medium',
          suggestion: `Consider using Figma typography: ${figmaValue}`
        };
      }
    }
    
    return null;
  }

  private static generateEnhancedCode(
    figmaData: FigmaApiResponse, 
    mappings: NodeCSSMapping[], 
    conflicts: StyleConflict[], 
    options: EnhancementOptions
  ): string {
    const enhancedData = {
      ...figmaData,
      cssEnhancement: {
        mappings,
        conflicts,
        coverage: mappings.length / this.getAllNodes(figmaData.document).length,
        options,
        enhancedAt: new Date().toISOString()
      }
    };
    
    return `// Enhanced Figma Data with CSS Integration
// Generated at: ${new Date().toISOString()}
// CSS Enhancement Coverage: ${(mappings.length / this.getAllNodes(figmaData.document).length * 100).toFixed(1)}%

const enhancedFigmaData = ${JSON.stringify(enhancedData, null, 2)};

// CSS Enhancement Utilities
const cssEnhancementUtils = {
  getMappingForNode: (nodeId) => {
    return enhancedFigmaData.cssEnhancement.mappings.find(m => m.nodeId === nodeId);
  },
  
  getConflictsForNode: (nodeId) => {
    return enhancedFigmaData.cssEnhancement.conflicts.filter(c => 
      enhancedFigmaData.cssEnhancement.mappings.some(m => 
        m.nodeId === nodeId && m.cssRules.some(rule => 
          rule.properties.some(prop => prop.property === c.property)
        )
      )
    );
  },
  
  applyEnhancedStyles: (node, element) => {
    const mapping = this.getMappingForNode(node.id);
    if (mapping) {
      mapping.cssRules.forEach(rule => {
        rule.properties.forEach(prop => {
          element.style.setProperty(prop.property, prop.value);
        });
      });
    }
  }
};

export { enhancedFigmaData, cssEnhancementUtils };
export default enhancedFigmaData;`;
  }

  private static generateSuggestions(
    mappings: NodeCSSMapping[], 
    conflicts: StyleConflict[], 
    options: EnhancementOptions
  ): string[] {
    const suggestions: string[] = [];
    
    // Coverage suggestions
    if (mappings.length === 0) {
      suggestions.push('No CSS mappings found. Consider adjusting your CSS selectors to match Figma node names.');
    } else if (mappings.length / this.getAllNodes.length < 0.3) {
      suggestions.push('Low CSS coverage. Consider using more specific selectors or enabling auto-mapping.');
    }
    
    // Conflict suggestions
    if (conflicts.length > 0) {
      const highSeverityConflicts = conflicts.filter(c => c.severity === 'high');
      if (highSeverityConflicts.length > 0) {
        suggestions.push(`${highSeverityConflicts.length} high-severity conflicts found. Review color and typography differences.`);
      }
    }
    
    // Mapping strategy suggestions
    const lowConfidenceMappings = mappings.filter(m => m.confidence < 0.7);
    if (lowConfidenceMappings.length > mappings.length * 0.5) {
      suggestions.push('Many mappings have low confidence. Consider switching to a different mapping strategy.');
    }
    
    return suggestions.slice(0, options.maxSuggestions);
  }

  // Utility methods
  private static getAllNodes(node: FigmaNode, nodes: FigmaNode[] = []): FigmaNode[] {
    nodes.push(node);
    if (node.children) {
      node.children.forEach(child => this.getAllNodes(child, nodes));
    }
    return nodes;
  }

  private static extractFigmaColor(fills: any[]): string | null {
    if (!fills || fills.length === 0) return null;
    
    const solidFill = fills.find(fill => fill.type === 'SOLID');
    if (solidFill && solidFill.color) {
      const { r, g, b } = solidFill.color;
      return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
    
    return null;
  }

  private static extractCSSColor(value: string): string | null {
    // Basic color extraction - can be enhanced
    const colorMatch = value.match(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|[a-zA-Z]+)/);
    return colorMatch ? colorMatch[0] : null;
  }

  private static areColorsEqual(color1: string, color2: string): boolean {
    return color1.toLowerCase() === color2.toLowerCase();
  }

  private static areColorsimilar(color1: string, color2: string): boolean {
    // Simple color similarity check - can be enhanced with proper color distance calculation
    return this.areColorsEqual(color1, color2);
  }

  private static isTypographySimilar(figmaStyle: any, cssProp: CSSProperty): boolean {
    // Basic typography similarity check
    if (cssProp.property === 'font-size' && figmaStyle.fontSize) {
      const figmaSize = figmaStyle.fontSize;
      const cssSize = parseFloat(cssProp.value);
      return Math.abs(figmaSize - cssSize) < 2;
    }
    
    return false;
  }

  private static isSpacingSimilar(boundingBox: any, cssProp: CSSProperty): boolean {
    // Basic spacing similarity check
    if (cssProp.property === 'width' && boundingBox.width) {
      const figmaWidth = boundingBox.width;
      const cssWidth = parseFloat(cssProp.value);
      return Math.abs(figmaWidth - cssWidth) < 5;
    }
    
    return false;
  }

  private static extractFigmaTypography(style: any, property: string): string | null {
    switch (property) {
      case 'font-size':
        return style.fontSize ? `${style.fontSize}px` : null;
      case 'font-weight':
        return style.fontWeight ? style.fontWeight.toString() : null;
      case 'font-family':
        return style.fontFamily || null;
      default:
        return null;
    }
  }

  private static getConflictSeverity(figmaValue: string, cssValue: string): StyleConflict['severity'] {
    // Simple severity calculation - can be enhanced
    if (figmaValue.includes('rgb') && cssValue.includes('rgb')) {
      return 'medium';
    }
    return 'low';
  }
}