import { ProcessedFigmaData, GenerationOptions } from '../../types';
import { DesignTokens } from '../design-system/tokenExtractor';

export const generateCSS = (data: ProcessedFigmaData, options: GenerationOptions): string => {
  const { processedDocument } = data;
  const styles: string[] = [];
  
  // Add header comment
  styles.push(`/* CSS Generated from Figma Design: ${data.metaData.name} */`);
  styles.push(`/* Generated on: ${new Date().toISOString()} */\n`);
  
  // Generate CSS for each node
  generateNodeCSS(processedDocument, styles, options);
  
  // Add utility classes
  if (options.includeHelpers) {
    styles.push(generateUtilityClasses());
  }
  
  return styles.join('\n');
};

const generateNodeCSS = (node: any, styles: string[], options: GenerationOptions, depth = 0) => {
  if (!node) return;
  
  const className = sanitizeClassName(node.name || `element-${node.id}`);
  const selector = `.figma-${className}`;
  
  let css = `${selector} {\n`;
  
  // Layout properties
  if (node.absoluteBoundingBox) {
    const { width, height } = node.absoluteBoundingBox;
    if (width) css += `  width: ${width}px;\n`;
    if (height) css += `  height: ${height}px;\n`;
  }
  
  // Display and layout mode
  if (node.layoutMode) {
    css += `  display: flex;\n`;
    css += `  flex-direction: ${node.layoutMode === 'VERTICAL' ? 'column' : 'row'};\n`;
    
    if (node.itemSpacing) {
      css += `  gap: ${node.itemSpacing}px;\n`;
    }
    
    // Alignment
    if (node.primaryAxisAlignItems) {
      const justifyContent = mapFigmaAlignment(node.primaryAxisAlignItems);
      css += `  justify-content: ${justifyContent};\n`;
    }
    
    if (node.counterAxisAlignItems) {
      const alignItems = mapFigmaAlignment(node.counterAxisAlignItems);
      css += `  align-items: ${alignItems};\n`;
    }
  }
  
  // Padding
  const padding = extractPadding(node);
  if (padding) {
    css += `  padding: ${padding};\n`;
  }
  
  // Background and fills
  if (node.fills && node.fills.length > 0) {
    const background = generateBackgroundCSS(node.fills);
    if (background) css += `  ${background}\n`;
  }
  
  // Border and strokes
  if (node.strokes && node.strokes.length > 0) {
    const border = generateBorderCSS(node.strokes, node.strokeWeight);
    if (border) css += `  ${border}\n`;
  }
  
  // Border radius
  if (node.cornerRadius !== undefined) {
    css += `  border-radius: ${node.cornerRadius}px;\n`;
  }
  
  // Typography for text nodes
  if (node.type === 'TEXT' && node.style) {
    css += generateTypographyCSS(node.style);
  }
  
  // Effects (shadows, blur)
  if (node.effects && node.effects.length > 0) {
    const effects = generateEffectsCSS(node.effects);
    if (effects) css += `  ${effects}\n`;
  }
  
  // Transform and positioning
  if (node.relativeTransform) {
    const transform = generateTransformCSS(node.relativeTransform);
    if (transform) css += `  ${transform}\n`;
  }
  
  css += '}\n\n';
  
  // Only add if there are actual styles
  if (css.split('\n').length > 3) {
    styles.push(css);
  }
  
  // Process children
  if (node.children) {
    node.children.forEach((child: any) => 
      generateNodeCSS(child, styles, options, depth + 1)
    );
  }
};

const generateBackgroundCSS = (fills: any[]): string => {
  const fill = fills[0]; // Use first fill for now
  
  switch (fill.type) {
    case 'SOLID':
      if (fill.color) {
        const { r, g, b, a = 1 } = fill.color;
        return `background-color: rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a});`;
      }
      break;
      
    case 'GRADIENT_LINEAR':
      if (fill.gradientStops) {
        const gradient = generateLinearGradient(fill);
        return `background: ${gradient};`;
      }
      break;
      
    case 'IMAGE':
      if (fill.imageRef) {
        return `background-image: url('${fill.imageRef}');\n  background-size: cover;\n  background-position: center;`;
      }
      break;
  }
  
  return '';
};

const generateLinearGradient = (fill: any): string => {
  const angle = calculateGradientAngle(fill.gradientTransform);
  const stops = fill.gradientStops.map((stop: any) => {
    const { r, g, b, a = 1 } = stop.color;
    const color = `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a})`;
    return `${color} ${Math.round(stop.position * 100)}%`;
  }).join(', ');
  
  return `linear-gradient(${angle}deg, ${stops})`;
};

const generateBorderCSS = (strokes: any[], strokeWeight: number = 1): string => {
  const stroke = strokes[0];
  if (stroke.type === 'SOLID' && stroke.color) {
    const { r, g, b, a = 1 } = stroke.color;
    const color = `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a})`;
    return `border: ${strokeWeight}px solid ${color};`;
  }
  return '';
};

const generateTypographyCSS = (style: any): string => {
  let css = '';
  
  if (style.fontFamily) {
    css += `  font-family: '${style.fontFamily}', sans-serif;\n`;
  }
  
  if (style.fontSize) {
    css += `  font-size: ${style.fontSize}px;\n`;
  }
  
  if (style.fontWeight) {
    css += `  font-weight: ${style.fontWeight};\n`;
  }
  
  if (style.lineHeightPx) {
    css += `  line-height: ${style.lineHeightPx}px;\n`;
  } else if (style.lineHeightPercent) {
    css += `  line-height: ${style.lineHeightPercent}%;\n`;
  }
  
  if (style.letterSpacing) {
    css += `  letter-spacing: ${style.letterSpacing}px;\n`;
  }
  
  if (style.textAlignHorizontal) {
    const textAlign = style.textAlignHorizontal.toLowerCase();
    if (['left', 'center', 'right', 'justify'].includes(textAlign)) {
      css += `  text-align: ${textAlign};\n`;
    }
  }
  
  if (style.textDecoration) {
    css += `  text-decoration: ${style.textDecoration.toLowerCase()};\n`;
  }
  
  return css;
};

const generateEffectsCSS = (effects: any[]): string => {
  const shadows: string[] = [];
  const filters: string[] = [];
  
  effects.forEach(effect => {
    switch (effect.type) {
      case 'DROP_SHADOW':
        if (effect.color) {
          const { r, g, b, a = 1 } = effect.color;
          const color = `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a})`;
          const x = effect.offset?.x || 0;
          const y = effect.offset?.y || 0;
          const blur = effect.radius || 0;
          shadows.push(`${x}px ${y}px ${blur}px ${color}`);
        }
        break;
        
      case 'INNER_SHADOW':
        if (effect.color) {
          const { r, g, b, a = 1 } = effect.color;
          const color = `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a})`;
          const x = effect.offset?.x || 0;
          const y = effect.offset?.y || 0;
          const blur = effect.radius || 0;
          shadows.push(`inset ${x}px ${y}px ${blur}px ${color}`);
        }
        break;
        
      case 'LAYER_BLUR':
        filters.push(`blur(${effect.radius || 0}px)`);
        break;
        
      case 'BACKGROUND_BLUR':
        filters.push(`backdrop-blur(${effect.radius || 0}px)`);
        break;
    }
  });
  
  let css = '';
  if (shadows.length > 0) {
    css += `box-shadow: ${shadows.join(', ')};\n`;
  }
  if (filters.length > 0) {
    css += `  filter: ${filters.join(' ')};\n`;
  }
  
  return css;
};

const generateTransformCSS = (transform: number[][]): string => {
  // Simplified transform generation - could be more sophisticated
  if (transform && transform.length >= 2) {
    const [a, b] = transform;
    if (a && b && (a[2] !== 0 || b[2] !== 0)) {
      return `transform: translate(${a[2]}px, ${b[2]}px);`;
    }
  }
  return '';
};

const generateUtilityClasses = (): string => {
  return `
/* Utility Classes */
.figma-hidden {
  display: none;
}

.figma-visible {
  display: block;
}

.figma-flex {
  display: flex;
}

.figma-flex-col {
  flex-direction: column;
}

.figma-flex-row {
  flex-direction: row;
}

.figma-items-center {
  align-items: center;
}

.figma-items-start {
  align-items: flex-start;
}

.figma-items-end {
  align-items: flex-end;
}

.figma-justify-center {
  justify-content: center;
}

.figma-justify-start {
  justify-content: flex-start;
}

.figma-justify-end {
  justify-content: flex-end;
}

.figma-justify-between {
  justify-content: space-between;
}
`;
};

// Helper functions
const sanitizeClassName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const extractPadding = (node: any): string | null => {
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = node;
  
  if (paddingTop !== undefined || paddingRight !== undefined || 
      paddingBottom !== undefined || paddingLeft !== undefined) {
    const top = paddingTop || 0;
    const right = paddingRight || 0;
    const bottom = paddingBottom || 0;
    const left = paddingLeft || 0;
    
    // Check if all values are the same
    if (top === right && right === bottom && bottom === left) {
      return `${top}px`;
    }
    
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }
  
  return null;
};

const mapFigmaAlignment = (alignment: string): string => {
  switch (alignment) {
    case 'MIN': return 'flex-start';
    case 'CENTER': return 'center';
    case 'MAX': return 'flex-end';
    case 'SPACE_BETWEEN': return 'space-between';
    default: return 'flex-start';
  }
};

const calculateGradientAngle = (gradientTransform: number[][]): number => {
  // Simplified angle calculation
  if (gradientTransform && gradientTransform.length >= 2) {
    const [a, b] = gradientTransform;
    if (a && b) {
      const angle = Math.atan2(b[1], a[0]) * (180 / Math.PI);
      return Math.round(angle);
    }
  }
  return 0;
};