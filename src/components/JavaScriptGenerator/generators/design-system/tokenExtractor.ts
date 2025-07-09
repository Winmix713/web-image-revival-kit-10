import { ProcessedFigmaData } from '../../types';

export interface DesignTokens {
  colors: Record<string, ColorToken>;
  typography: Record<string, TypographyToken>;
  spacing: Record<string, SpacingToken>;
  effects: Record<string, EffectToken>;
  borders: Record<string, BorderToken>;
  layout: Record<string, LayoutToken>;
}

export interface ColorToken {
  value: string;
  type: 'color';
  description?: string;
  usage: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic';
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
  type: 'typography';
}

export interface SpacingToken {
  value: number;
  type: 'spacing';
  unit: 'px' | 'rem' | '%';
}

export interface EffectToken {
  type: 'effect';
  effectType: 'dropShadow' | 'innerShadow' | 'blur';
  value: string;
  cssValue: string;
}

export interface BorderToken {
  width: number;
  style: string;
  color: string;
  radius?: number;
  type: 'border';
}

export interface LayoutToken {
  type: 'layout';
  property: 'gap' | 'padding' | 'margin';
  value: number;
}

export const extractDesignTokens = (data: ProcessedFigmaData): DesignTokens => {
  const tokens: DesignTokens = {
    colors: {},
    typography: {},
    spacing: {},
    effects: {},
    borders: {},
    layout: {}
  };

  // Extract from styles first (Figma design tokens)
  extractFromStyles(data.styles, tokens);
  
  // Extract from document structure
  extractFromDocument(data.processedDocument, tokens);
  
  // Categorize and deduplicate
  categorizeTokens(tokens);
  
  return tokens;
};

const extractFromStyles = (styles: Record<string, any>, tokens: DesignTokens) => {
  Object.entries(styles).forEach(([key, style]) => {
    const name = style.name || key;
    
    switch (style.styleType) {
      case 'FILL':
        if (style.fills?.[0]?.type === 'SOLID') {
          tokens.colors[name] = {
            value: rgbaToString(style.fills[0].color),
            type: 'color',
            usage: categorizeColorUsage(name)
          };
        }
        break;
        
      case 'TEXT':
        if (style.style) {
          tokens.typography[name] = {
            fontFamily: style.style.fontFamily || 'inherit',
            fontSize: style.style.fontSize || 16,
            fontWeight: style.style.fontWeight || 400,
            lineHeight: style.style.lineHeightPx || style.style.fontSize * 1.2,
            letterSpacing: style.style.letterSpacing,
            type: 'typography'
          };
        }
        break;
        
      case 'EFFECT':
        if (style.effects?.[0]) {
          const effect = style.effects[0];
          tokens.effects[name] = {
            type: 'effect',
            effectType: mapEffectType(effect.type),
            value: JSON.stringify(effect),
            cssValue: effectToCss(effect)
          };
        }
        break;
    }
  });
};

const extractFromDocument = (node: any, tokens: DesignTokens) => {
  if (!node) return;
  
  // Extract colors from fills
  if (node.fills) {
    node.fills.forEach((fill: any, index: number) => {
      if (fill.type === 'SOLID' && fill.color) {
        const colorValue = rgbaToString(fill.color);
        const tokenName = `${node.name || 'unnamed'}-fill-${index}`;
        tokens.colors[tokenName] = {
          value: colorValue,
          type: 'color',
          usage: 'neutral'
        };
      }
    });
  }
  
  // Extract spacing from layout properties
  if (node.itemSpacing !== undefined) {
    tokens.spacing[`gap-${node.itemSpacing}`] = {
      value: node.itemSpacing,
      type: 'spacing',
      unit: 'px'
    };
  }
  
  ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(prop => {
    if (node[prop] !== undefined) {
      tokens.spacing[`${prop}-${node[prop]}`] = {
        value: node[prop],
        type: 'spacing',
        unit: 'px'
      };
    }
  });
  
  // Extract border properties
  if (node.strokes?.[0]) {
    const stroke = node.strokes[0];
    tokens.borders[`${node.name || 'unnamed'}-border`] = {
      width: node.strokeWeight || 1,
      style: 'solid',
      color: stroke.color ? rgbaToString(stroke.color) : '#000000',
      radius: node.cornerRadius,
      type: 'border'
    };
  }
  
  // Extract typography from text nodes
  if (node.type === 'TEXT' && node.style) {
    const tokenName = `${node.name || 'text'}-style`;
    tokens.typography[tokenName] = {
      fontFamily: node.style.fontFamily || 'inherit',
      fontSize: node.style.fontSize || 16,
      fontWeight: node.style.fontWeight || 400,
      lineHeight: node.style.lineHeightPx || node.style.fontSize * 1.2,
      letterSpacing: node.style.letterSpacing,
      type: 'typography'
    };
  }
  
  // Recursively extract from children
  if (node.children) {
    node.children.forEach((child: any) => extractFromDocument(child, tokens));
  }
};

const categorizeTokens = (tokens: DesignTokens) => {
  // Create normalized spacing scale
  const spacingValues = Object.values(tokens.spacing)
    .map(token => token.value)
    .sort((a, b) => a - b);
  
  const uniqueSpacing = [...new Set(spacingValues)];
  tokens.spacing = {};
  
  uniqueSpacing.forEach((value, index) => {
    tokens.spacing[`space-${index + 1}`] = {
      value,
      type: 'spacing',
      unit: 'px'
    };
  });
};

const categorizeColorUsage = (name: string): 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic' => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('primary') || lowerName.includes('brand')) return 'primary';
  if (lowerName.includes('secondary')) return 'secondary';
  if (lowerName.includes('accent') || lowerName.includes('highlight')) return 'accent';
  if (lowerName.includes('error') || lowerName.includes('warning') || lowerName.includes('success')) return 'semantic';
  
  return 'neutral';
};

const mapEffectType = (figmaType: string): 'dropShadow' | 'innerShadow' | 'blur' => {
  switch (figmaType) {
    case 'DROP_SHADOW': return 'dropShadow';
    case 'INNER_SHADOW': return 'innerShadow';
    case 'LAYER_BLUR':
    case 'BACKGROUND_BLUR': return 'blur';
    default: return 'dropShadow';
  }
};

const rgbaToString = (color: any): string => {
  const { r, g, b, a = 1 } = color;
  const red = Math.round(r * 255);
  const green = Math.round(g * 255);
  const blue = Math.round(b * 255);
  
  if (a === 1) {
    return `rgb(${red}, ${green}, ${blue})`;
  }
  return `rgba(${red}, ${green}, ${blue}, ${a})`;
};

const effectToCss = (effect: any): string => {
  switch (effect.type) {
    case 'DROP_SHADOW':
      const shadowColor = effect.color ? rgbaToString(effect.color) : 'rgba(0,0,0,0.25)';
      return `${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${shadowColor}`;
    
    case 'INNER_SHADOW':
      const innerColor = effect.color ? rgbaToString(effect.color) : 'rgba(0,0,0,0.25)';
      return `inset ${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${innerColor}`;
    
    case 'LAYER_BLUR':
      return `blur(${effect.radius || 0}px)`;
    
    case 'BACKGROUND_BLUR':
      return `backdrop-blur(${effect.radius || 0}px)`;
    
    default:
      return '';
  }
};

export const generateTokensCSS = (tokens: DesignTokens): string => {
  let css = ':root {\n';
  
  // Colors
  Object.entries(tokens.colors).forEach(([name, token]) => {
    css += `  --color-${kebabCase(name)}: ${token.value};\n`;
  });
  
  // Spacing
  Object.entries(tokens.spacing).forEach(([name, token]) => {
    css += `  --spacing-${kebabCase(name)}: ${token.value}${token.unit};\n`;
  });
  
  // Typography
  Object.entries(tokens.typography).forEach(([name, token]) => {
    css += `  --font-family-${kebabCase(name)}: ${token.fontFamily};\n`;
    css += `  --font-size-${kebabCase(name)}: ${token.fontSize}px;\n`;
    css += `  --font-weight-${kebabCase(name)}: ${token.fontWeight};\n`;
    css += `  --line-height-${kebabCase(name)}: ${token.lineHeight}px;\n`;
  });
  
  css += '}\n';
  return css;
};

const kebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
};