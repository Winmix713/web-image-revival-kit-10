
// Enhanced CSS Parser for Figma JS Generator
export interface CSSProperty {
  property: string;
  value: string;
  important: boolean;
  line: number;
}

export interface CSSRule {
  selector: string;
  properties: CSSProperty[];
  specificity: number;
  line: number;
  column: number;
}

export interface CSSParseResult {
  rules: CSSRule[];
  errors: string[];
  warnings: string[];
  statistics: {
    totalRules: number;
    totalProperties: number;
    totalSelectors: number;
    processingTime: number;
  };
  isValid: boolean;
}

// Legacy interface for backwards compatibility
export interface ParsedCSSRule {
  selector: string;
  properties: Record<string, string>;
  specificity: number;
  isComponent: boolean;
  figmaLayer?: string;
}

export interface ParsedCSSData {
  rules: ParsedCSSRule[];
  variables: Record<string, string>;
  colors: string[];
  fonts: string[];
  spacing: string[];
  borderRadius: string[];
  shadows: string[];
  animations: string[];
}

export class CSSParser {
  // Enhanced parse method for CSS enhancement
  static parse(cssText: string): CSSParseResult {
    const startTime = performance.now();
    const result: CSSParseResult = {
      rules: [],
      errors: [],
      warnings: [],
      statistics: {
        totalRules: 0,
        totalProperties: 0,
        totalSelectors: 0,
        processingTime: 0
      },
      isValid: true
    };

    try {
      // Remove comments
      const cleanCSS = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Parse rules using regex
      const ruleRegex = /([^{]+)\{([^}]+)\}/g;
      let match;
      let lineNumber = 1;

      while ((match = ruleRegex.exec(cleanCSS)) !== null) {
        const selector = match[1].trim();
        const declarations = match[2].trim();
        
        if (!selector || !declarations) {
          result.warnings.push(`Empty rule at line ${lineNumber}`);
          continue;
        }

        try {
          const properties = this.parsePropertiesEnhanced(declarations, lineNumber);
          
          result.rules.push({
            selector,
            properties,
            specificity: this.calculateSpecificity(selector),
            line: lineNumber,
            column: 1
          });

          result.statistics.totalProperties += properties.length;
          result.statistics.totalSelectors += selector.split(',').length;
          
        } catch (error) {
          result.errors.push(`Error parsing rule at line ${lineNumber}: ${error}`);
          result.isValid = false;
        }
        
        lineNumber++;
      }

      result.statistics.totalRules = result.rules.length;
      result.statistics.processingTime = performance.now() - startTime;
      
    } catch (error) {
      result.errors.push(`Critical parsing error: ${error}`);
      result.isValid = false;
    }

    return result;
  }

  // Legacy parse method for backwards compatibility
  static parseLegacy(cssText: string): ParsedCSSData {
    const rules = this.parseRules(cssText);
    const variables = this.extractVariables(cssText);
    
    return {
      rules,
      variables,
      colors: this.extractColors(rules),
      fonts: this.extractFonts(rules),
      spacing: this.extractSpacing(rules),
      borderRadius: this.extractBorderRadius(rules),
      shadows: this.extractShadows(rules),
      animations: this.extractAnimations(rules)
    };
  }

  private static parsePropertiesEnhanced(declarations: string, startLine: number): CSSProperty[] {
    const properties: CSSProperty[] = [];
    const propRegex = /([a-zA-Z-]+)\s*:\s*([^;]+)(!important)?;?/g;
    let match;
    let lineOffset = 0;

    while ((match = propRegex.exec(declarations)) !== null) {
      properties.push({
        property: match[1].trim(),
        value: match[2].trim(),
        important: !!match[3],
        line: startLine + lineOffset
      });
      lineOffset++;
    }

    return properties;
  }

  private static parseRules(cssText: string): ParsedCSSRule[] {
    const rules: ParsedCSSRule[] = [];
    
    // Remove comments and normalize whitespace
    const cleanCSS = cssText
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Match CSS rules
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(cleanCSS)) !== null) {
      const selector = match[1].trim();
      const propertiesText = match[2].trim();
      
      const properties = this.parseProperties(propertiesText);
      const specificity = this.calculateSpecificity(selector);
      const isComponent = this.isComponentSelector(selector);
      const figmaLayer = this.extractFigmaLayer(selector);

      rules.push({
        selector,
        properties,
        specificity,
        isComponent,
        figmaLayer
      });
    }

    return rules;
  }

  private static parseProperties(propertiesText: string): Record<string, string> {
    const properties: Record<string, string> = {};
    
    const declarations = propertiesText.split(';').filter(d => d.trim());
    
    declarations.forEach(declaration => {
      const colonIndex = declaration.indexOf(':');
      if (colonIndex > 0) {
        const property = declaration.substring(0, colonIndex).trim();
        const value = declaration.substring(colonIndex + 1).trim();
        properties[property] = value;
      }
    });

    return properties;
  }

  private static calculateSpecificity(selector: string): number {
    // Simple specificity calculation
    let specificity = 0;
    
    // Count IDs
    specificity += (selector.match(/#/g) || []).length * 100;
    
    // Count classes, attributes, and pseudo-classes
    specificity += (selector.match(/\.|:|\[/g) || []).length * 10;
    
    // Count elements
    specificity += (selector.match(/[a-zA-Z]/g) || []).length;
    
    return specificity;
  }

  private static isComponentSelector(selector: string): boolean {
    return /\.(component|figma|layer|frame|group)/i.test(selector);
  }

  private static extractFigmaLayer(selector: string): string | undefined {
    const match = selector.match(/\.(layer-\w+|component-\w+|frame-\w+)/i);
    return match ? match[1] : undefined;
  }

  private static extractVariables(cssText: string): Record<string, string> {
    const variables: Record<string, string> = {};
    const varRegex = /--([\w-]+):\s*([^;]+);/g;
    let match;

    while ((match = varRegex.exec(cssText)) !== null) {
      variables[match[1]] = match[2].trim();
    }

    return variables;
  }

  private static extractColors(rules: ParsedCSSRule[]): string[] {
    const colors = new Set<string>();
    
    rules.forEach(rule => {
      Object.entries(rule.properties).forEach(([prop, value]) => {
        if (this.isColorProperty(prop)) {
          const extractedColors = this.extractColorValues(value);
          extractedColors.forEach(color => colors.add(color));
        }
      });
    });

    return Array.from(colors);
  }

  private static extractFonts(rules: ParsedCSSRule[]): string[] {
    const fonts = new Set<string>();
    
    rules.forEach(rule => {
      const fontFamily = rule.properties['font-family'];
      if (fontFamily) {
        fonts.add(fontFamily.replace(/['"]/g, ''));
      }
    });

    return Array.from(fonts);
  }

  private static extractSpacing(rules: ParsedCSSRule[]): string[] {
    const spacing = new Set<string>();
    const spacingProps = ['margin', 'padding', 'gap', 'top', 'right', 'bottom', 'left'];
    
    rules.forEach(rule => {
      Object.entries(rule.properties).forEach(([prop, value]) => {
        if (spacingProps.some(sp => prop.includes(sp))) {
          const values = value.match(/\d+(\.\d+)?(px|rem|em|%)/g);
          values?.forEach(v => spacing.add(v));
        }
      });
    });

    return Array.from(spacing);
  }

  private static extractBorderRadius(rules: ParsedCSSRule[]): string[] {
    const borderRadius = new Set<string>();
    
    rules.forEach(rule => {
      const radius = rule.properties['border-radius'];
      if (radius) {
        borderRadius.add(radius);
      }
    });

    return Array.from(borderRadius);
  }

  private static extractShadows(rules: ParsedCSSRule[]): string[] {
    const shadows = new Set<string>();
    
    rules.forEach(rule => {
      const boxShadow = rule.properties['box-shadow'];
      if (boxShadow) {
        shadows.add(boxShadow);
      }
    });

    return Array.from(shadows);
  }

  private static extractAnimations(rules: ParsedCSSRule[]): string[] {
    const animations = new Set<string>();
    
    rules.forEach(rule => {
      Object.entries(rule.properties).forEach(([prop, value]) => {
        if (prop.includes('animation') || prop.includes('transition')) {
          animations.add(`${prop}: ${value}`);
        }
      });
    });

    return Array.from(animations);
  }

  private static isColorProperty(prop: string): boolean {
    return /color|background|border|shadow|fill|stroke/i.test(prop);
  }

  private static extractColorValues(value: string): string[] {
    const colors: string[] = [];
    
    // Match hex colors
    const hexMatches = value.match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})/g);
    if (hexMatches) colors.push(...hexMatches);
    
    // Match rgb/rgba colors
    const rgbMatches = value.match(/rgba?\([^)]+\)/g);
    if (rgbMatches) colors.push(...rgbMatches);
    
    // Match hsl/hsla colors
    const hslMatches = value.match(/hsla?\([^)]+\)/g);
    if (hslMatches) colors.push(...hslMatches);
    
    return colors;
  }
}
