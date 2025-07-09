
import { FigmaNode } from '../../types/figma';

export const processNodeStructure = (node: FigmaNode): any => {
  const computedStyles = extractStyles(node);
  
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    computedStyles,
    designTokens: {
      boundVariables: node.boundVariables || {},
      styleReferences: node.styleReferences || {},
    },
    componentProperties: {
      definitions: node.componentPropertyDefinitions || {},
      values: extractComponentPropertyValues(node),
    },
    children: node.children ? node.children.map(child => processNodeStructure(child)) : [],
    absoluteBoundingBox: node.absoluteBoundingBox,
    constraints: node.constraints,
    characters: node.characters,
  };
};

const extractStyles = (node: FigmaNode) => {
  return {
    layout: {
      layoutMode: node.layoutMode,
      itemSpacing: node.itemSpacing,
      paddingLeft: node.paddingLeft || 0,
      paddingRight: node.paddingRight || 0,
      paddingTop: node.paddingTop || 0,
      paddingBottom: node.paddingBottom || 0,
    },
    fills: node.fills ? node.fills.map(fill => ({
      ...fill,
      computedColor: getColorFromFill(fill),
    })) : [],
    strokes: node.strokes ? node.strokes.map(stroke => ({
      ...stroke,
      computedColor: stroke.color ? rgbaToString(stroke.color) : null,
    })) : [],
    effects: node.effects ? node.effects.map(effect => ({
      ...effect,
      computedColor: effect.color ? rgbaToString(effect.color) : null,
      cssEquivalent: effectToCss(effect),
    })) : [],
    typography: node.style ? {
      ...node.style,
      cssEquivalent: getTypographyStyles(node.style),
    } : null,
    cornerRadius: node.cornerRadius,
  };
};

const extractComponentPropertyValues = (node: FigmaNode): Record<string, any> => {
  const values: Record<string, any> = {};
  
  if (node.componentPropertyDefinitions) {
    Object.keys(node.componentPropertyDefinitions).forEach(key => {
      const definition = node.componentPropertyDefinitions![key];
      values[key] = definition.defaultValue;
    });
  }

  return values;
};

// Helper functions
const getColorFromFill = (fill: any): string => {
  if (fill.type === 'SOLID' && fill.color) {
    return rgbaToString(fill.color);
  }
  if (fill.type === 'GRADIENT_LINEAR' && fill.gradientStops) {
    return gradientToString(fill);
  }
  return 'transparent';
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

const gradientToString = (fill: any): string => {
  const stops = fill.gradientStops.map((stop: any) => {
    const color = rgbaToString(stop.color);
    const position = Math.round(stop.position * 100);
    return `${color} ${position}%`;
  }).join(', ');

  return `linear-gradient(${stops})`;
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
