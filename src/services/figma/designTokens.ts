
import { FigmaApiResponse } from '../../types/figma';

export const extractDesignTokens = (figmaData: FigmaApiResponse) => {
  return {
    colors: extractColorTokens(figmaData),
    typography: extractTypographyTokens(figmaData),
    spacing: extractSpacingTokens(figmaData),
    effects: extractEffectTokens(figmaData),
  };
};

const extractColorTokens = (figmaData: FigmaApiResponse): Record<string, string> => {
  const colors: Record<string, string> = {};
  
  Object.entries(figmaData.styles).forEach(([key, style]: [string, any]) => {
    if (style.styleType === 'FILL' && style.fills?.[0]) {
      const fill = style.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        colors[style.name || key] = rgbaToString(fill.color);
      }
    }
  });

  return colors;
};

const extractTypographyTokens = (figmaData: FigmaApiResponse): Record<string, any> => {
  const typography: Record<string, any> = {};
  
  Object.entries(figmaData.styles).forEach(([key, style]: [string, any]) => {
    if (style.styleType === 'TEXT' && style.style) {
      typography[style.name || key] = getTypographyStyles(style.style);
    }
  });

  return typography;
};

const extractSpacingTokens = (figmaData: FigmaApiResponse): Record<string, number> => {
  const spacingValues = new Set<number>();
  
  const traverse = (node: any) => {
    if (node.itemSpacing) spacingValues.add(node.itemSpacing);
    if (node.paddingLeft) spacingValues.add(node.paddingLeft);
    if (node.paddingRight) spacingValues.add(node.paddingRight);
    if (node.paddingTop) spacingValues.add(node.paddingTop);
    if (node.paddingBottom) spacingValues.add(node.paddingBottom);
    
    node.children?.forEach(traverse);
  };

  traverse(figmaData.document);

  const spacing: Record<string, number> = {};
  Array.from(spacingValues).sort((a, b) => a - b).forEach((value, index) => {
    spacing[`spacing-${index + 1}`] = value;
  });

  return spacing;
};

const extractEffectTokens = (figmaData: FigmaApiResponse): Record<string, any> => {
  const effects: Record<string, any> = {};
  
  Object.entries(figmaData.styles).forEach(([key, style]: [string, any]) => {
    if (style.styleType === 'EFFECT' && style.effects) {
      effects[style.name || key] = style.effects.map((effect: any) => ({
        ...effect,
        cssEquivalent: effectToCss(effect),
      }));
    }
  });

  return effects;
};

// Helper functions
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

const getTypographyStyles = (style: any) => {
  return {
    fontFamily: style.fontFamily || 'inherit',
    fontSize: style.fontSize ? `${style.fontSize}px` : 'inherit',
    fontWeight: style.fontWeight || 'normal',
    lineHeight: style.lineHeightPx ? `${style.lineHeightPx}px` : 'normal',
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : 'normal',
    textAlign: style.textAlignHorizontal?.toLowerCase() || 'left',
    textAlignVertical: style.textAlignVertical?.toLowerCase() || 'top',
  };
};

const effectToCss = (effect: any): string => {
  switch (effect.type) {
    case 'DROP_SHADOW':
      const shadowColor = effect.color ? rgbaToString(effect.color) : 'rgba(0,0,0,0.25)';
      return `drop-shadow(${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${shadowColor})`;
    
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
