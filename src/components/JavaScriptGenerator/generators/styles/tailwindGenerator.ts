import { ProcessedFigmaData, GenerationOptions } from '../../types';

export const generateTailwindClasses = (data: ProcessedFigmaData, options: GenerationOptions): string => {
  const { processedDocument } = data;
  const output: string[] = [];
  
  // Add header comment
  output.push(`<!-- Tailwind CSS Classes for Figma Design: ${data.metaData.name} -->`);
  output.push(`<!-- Generated on: ${new Date().toISOString()} -->\n`);
  
  // Generate HTML with Tailwind classes
  const htmlStructure = generateTailwindHTML(processedDocument, 0);
  output.push(htmlStructure);
  
  // Add custom CSS for values not supported by Tailwind
  if (options.includeHelpers) {
    const customCSS = generateCustomTailwindCSS(processedDocument);
    if (customCSS) {
      output.push('\n<style>');
      output.push(customCSS);
      output.push('</style>');
    }
  }
  
  // Add Tailwind config suggestions
  if (options.includeComments) {
    output.push('\n' + generateTailwindConfig(data));
  }
  
  return output.join('\n');
};

const generateTailwindHTML = (node: any, depth: number): string => {
  if (!node) return '';
  
  const indent = '  '.repeat(depth);
  const tagName = getHTMLTag(node.type);
  const classes = generateTailwindClassList(node);
  
  let html = `${indent}<${tagName}`;
  
  if (classes.length > 0) {
    html += ` class="${classes.join(' ')}"`;
  }
  
  // Add data attributes for identification
  if (node.name) {
    html += ` data-figma-name="${node.name}"`;
  }
  
  if (node.children && node.children.length > 0) {
    html += '>\n';
    
    // Add text content for text nodes
    if (node.type === 'TEXT' && node.characters) {
      html += `${indent}  ${node.characters}\n`;
    }
    
    // Process children
    node.children.forEach((child: any) => {
      html += generateTailwindHTML(child, depth + 1);
    });
    
    html += `${indent}</${tagName}>\n`;
  } else if (node.type === 'TEXT' && node.characters) {
    html += `>${node.characters}</${tagName}>\n`;
  } else {
    html += ' />\n';
  }
  
  return html;
};

const generateTailwindClassList = (node: any): string[] => {
  const classes: string[] = [];
  
  // Layout and display
  if (node.layoutMode) {
    classes.push('flex');
    
    if (node.layoutMode === 'VERTICAL') {
      classes.push('flex-col');
    }
    
    // Gap spacing
    if (node.itemSpacing !== undefined) {
      const gapClass = mapSpacingToTailwind(node.itemSpacing, 'gap');
      if (gapClass) classes.push(gapClass);
    }
    
    // Alignment
    if (node.primaryAxisAlignItems) {
      const justifyClass = mapAlignmentToJustify(node.primaryAxisAlignItems);
      if (justifyClass) classes.push(justifyClass);
    }
    
    if (node.counterAxisAlignItems) {
      const alignClass = mapAlignmentToAlign(node.counterAxisAlignItems);
      if (alignClass) classes.push(alignClass);
    }
  }
  
  // Sizing
  if (node.absoluteBoundingBox) {
    const { width, height } = node.absoluteBoundingBox;
    
    const widthClass = mapSizeToTailwind(width, 'w');
    if (widthClass) classes.push(widthClass);
    
    const heightClass = mapSizeToTailwind(height, 'h');
    if (heightClass) classes.push(heightClass);
  }
  
  // Padding
  const paddingClasses = mapPaddingToTailwind(node);
  classes.push(...paddingClasses);
  
  // Background
  if (node.fills && node.fills.length > 0) {
    const backgroundClasses = mapFillsToTailwind(node.fills);
    classes.push(...backgroundClasses);
  }
  
  // Border
  if (node.strokes && node.strokes.length > 0) {
    const borderClasses = mapStrokesToTailwind(node.strokes, node.strokeWeight);
    classes.push(...borderClasses);
  }
  
  // Border radius
  if (node.cornerRadius !== undefined) {
    const radiusClass = mapBorderRadiusToTailwind(node.cornerRadius);
    if (radiusClass) classes.push(radiusClass);
  }
  
  // Typography
  if (node.type === 'TEXT' && node.style) {
    const typographyClasses = mapTypographyToTailwind(node.style);
    classes.push(...typographyClasses);
  }
  
  // Effects (shadows)
  if (node.effects && node.effects.length > 0) {
    const shadowClasses = mapEffectsToTailwind(node.effects);
    classes.push(...shadowClasses);
  }
  
  // Position and transform
  if (node.constraints || node.relativeTransform) {
    const positionClasses = mapPositionToTailwind(node);
    classes.push(...positionClasses);
  }
  
  return classes.filter(Boolean);
};

const mapSpacingToTailwind = (value: number, prefix: string): string | null => {
  // Common Tailwind spacing scale
  const spacingMap: { [key: number]: string } = {
    0: '0',
    4: '1',
    8: '2',
    12: '3',
    16: '4',
    20: '5',
    24: '6',
    32: '8',
    40: '10',
    48: '12',
    64: '16',
    80: '20',
    96: '24'
  };
  
  if (spacingMap[value]) {
    return `${prefix}-${spacingMap[value]}`;
  }
  
  // For custom values, we'll need custom CSS
  return null;
};

const mapSizeToTailwind = (value: number, prefix: string): string | null => {
  // Common size mappings
  if (value <= 0) return null;
  
  const sizeMap: { [key: number]: string } = {
    16: '4',
    24: '6',
    32: '8',
    40: '10',
    48: '12',
    64: '16',
    80: '20',
    96: '24',
    128: '32',
    256: '64',
    384: '96'
  };
  
  if (sizeMap[value]) {
    return `${prefix}-${sizeMap[value]}`;
  }
  
  // For responsive sizing
  if (value >= 100) {
    if (value <= 640) return `${prefix}-full`;
    if (value <= 768) return `${prefix}-screen`;
  }
  
  return null;
};

const mapPaddingToTailwind = (node: any): string[] => {
  const classes: string[] = [];
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = node;
  
  // Check if all padding values are the same
  if (paddingTop === paddingRight && 
      paddingRight === paddingBottom && 
      paddingBottom === paddingLeft && 
      paddingTop !== undefined) {
    const paddingClass = mapSpacingToTailwind(paddingTop, 'p');
    if (paddingClass) return [paddingClass];
  }
  
  // Individual padding values
  if (paddingTop !== undefined) {
    const ptClass = mapSpacingToTailwind(paddingTop, 'pt');
    if (ptClass) classes.push(ptClass);
  }
  
  if (paddingRight !== undefined) {
    const prClass = mapSpacingToTailwind(paddingRight, 'pr');
    if (prClass) classes.push(prClass);
  }
  
  if (paddingBottom !== undefined) {
    const pbClass = mapSpacingToTailwind(paddingBottom, 'pb');
    if (pbClass) classes.push(pbClass);
  }
  
  if (paddingLeft !== undefined) {
    const plClass = mapSpacingToTailwind(paddingLeft, 'pl');
    if (plClass) classes.push(plClass);
  }
  
  return classes;
};

const mapFillsToTailwind = (fills: any[]): string[] => {
  const classes: string[] = [];
  const fill = fills[0]; // Use first fill
  
  if (fill.type === 'SOLID' && fill.color) {
    const { r, g, b } = fill.color;
    const hex = rgbToHex(r, g, b);
    
    // Check for common Tailwind colors
    const colorClass = mapColorToTailwind(hex);
    if (colorClass) {
      classes.push(`bg-${colorClass}`);
    }
  }
  
  return classes;
};

const mapStrokesToTailwind = (strokes: any[], strokeWeight: number = 1): string[] => {
  const classes: string[] = [];
  const stroke = strokes[0];
  
  if (stroke.type === 'SOLID' && stroke.color) {
    // Border width
    const weightMap: { [key: number]: string } = {
      1: '',
      2: 'border-2',
      4: 'border-4',
      8: 'border-8'
    };
    
    const weightClass = weightMap[strokeWeight] || 'border';
    classes.push(weightClass);
    
    // Border color
    const { r, g, b } = stroke.color;
    const hex = rgbToHex(r, g, b);
    const colorClass = mapColorToTailwind(hex);
    if (colorClass) {
      classes.push(`border-${colorClass}`);
    }
  }
  
  return classes;
};

const mapBorderRadiusToTailwind = (radius: number): string | null => {
  const radiusMap: { [key: number]: string } = {
    0: 'rounded-none',
    2: 'rounded-sm',
    4: 'rounded',
    6: 'rounded-md',
    8: 'rounded-lg',
    12: 'rounded-xl',
    16: 'rounded-2xl',
    24: 'rounded-3xl',
    9999: 'rounded-full'
  };
  
  return radiusMap[radius] || null;
};

const mapTypographyToTailwind = (style: any): string[] => {
  const classes: string[] = [];
  
  // Font size
  if (style.fontSize) {
    const sizeMap: { [key: number]: string } = {
      12: 'text-xs',
      14: 'text-sm',
      16: 'text-base',
      18: 'text-lg',
      20: 'text-xl',
      24: 'text-2xl',
      30: 'text-3xl',
      36: 'text-4xl',
      48: 'text-5xl',
      60: 'text-6xl'
    };
    
    const sizeClass = sizeMap[style.fontSize];
    if (sizeClass) classes.push(sizeClass);
  }
  
  // Font weight
  if (style.fontWeight) {
    const weightMap: { [key: number]: string } = {
      100: 'font-thin',
      200: 'font-extralight',
      300: 'font-light',
      400: 'font-normal',
      500: 'font-medium',
      600: 'font-semibold',
      700: 'font-bold',
      800: 'font-extrabold',
      900: 'font-black'
    };
    
    const weightClass = weightMap[style.fontWeight];
    if (weightClass) classes.push(weightClass);
  }
  
  // Text alignment
  if (style.textAlignHorizontal) {
    const alignMap: { [key: string]: string } = {
      'LEFT': 'text-left',
      'CENTER': 'text-center',
      'RIGHT': 'text-right',
      'JUSTIFIED': 'text-justify'
    };
    
    const alignClass = alignMap[style.textAlignHorizontal];
    if (alignClass) classes.push(alignClass);
  }
  
  return classes;
};

const mapEffectsToTailwind = (effects: any[]): string[] => {
  const classes: string[] = [];
  
  effects.forEach(effect => {
    if (effect.type === 'DROP_SHADOW') {
      // Map common shadow values to Tailwind classes
      const shadowMap: { [key: string]: string } = {
        '0 1px 3px': 'shadow-sm',
        '0 4px 6px': 'shadow',
        '0 10px 15px': 'shadow-md',
        '0 20px 25px': 'shadow-lg',
        '0 25px 50px': 'shadow-xl',
        '0 35px 60px': 'shadow-2xl'
      };
      
      const x = effect.offset?.x || 0;
      const y = effect.offset?.y || 0;
      const blur = effect.radius || 0;
      const shadowKey = `${x} ${y}px ${blur}px`;
      
      const shadowClass = shadowMap[shadowKey];
      if (shadowClass) classes.push(shadowClass);
    }
  });
  
  return classes;
};

const mapPositionToTailwind = (node: any): string[] => {
  const classes: string[] = [];
  
  // Add positioning classes based on constraints
  if (node.constraints) {
    const { horizontal, vertical } = node.constraints;
    
    if (horizontal === 'CENTER') {
      classes.push('mx-auto');
    }
    
    if (vertical === 'CENTER') {
      classes.push('my-auto');
    }
  }
  
  return classes;
};

const mapAlignmentToJustify = (alignment: string): string | null => {
  const map: { [key: string]: string } = {
    'MIN': 'justify-start',
    'CENTER': 'justify-center',
    'MAX': 'justify-end',
    'SPACE_BETWEEN': 'justify-between'
  };
  
  return map[alignment] || null;
};

const mapAlignmentToAlign = (alignment: string): string | null => {
  const map: { [key: string]: string } = {
    'MIN': 'items-start',
    'CENTER': 'items-center',
    'MAX': 'items-end'
  };
  
  return map[alignment] || null;
};

const mapColorToTailwind = (hex: string): string | null => {
  // Common Tailwind color mappings
  const colorMap: { [key: string]: string } = {
    '#ffffff': 'white',
    '#000000': 'black',
    '#f3f4f6': 'gray-100',
    '#e5e7eb': 'gray-200',
    '#d1d5db': 'gray-300',
    '#9ca3af': 'gray-400',
    '#6b7280': 'gray-500',
    '#374151': 'gray-700',
    '#1f2937': 'gray-800',
    '#111827': 'gray-900',
    '#dbeafe': 'blue-100',
    '#3b82f6': 'blue-500',
    '#1d4ed8': 'blue-700',
    '#ef4444': 'red-500',
    '#10b981': 'green-500',
    '#f59e0b': 'yellow-500'
  };
  
  return colorMap[hex.toLowerCase()] || null;
};

const generateCustomTailwindCSS = (node: any): string => {
  const customStyles: string[] = [];
  
  // Generate custom CSS for values that don't map to Tailwind
  const collectCustomStyles = (currentNode: any) => {
    if (!currentNode) return;
    
    const className = sanitizeClassName(currentNode.name || `element-${currentNode.id}`);
    
    // Custom spacing values
    if (currentNode.itemSpacing && !mapSpacingToTailwind(currentNode.itemSpacing, 'gap')) {
      customStyles.push(`.figma-${className} { gap: ${currentNode.itemSpacing}px; }`);
    }
    
    // Custom sizes
    if (currentNode.absoluteBoundingBox) {
      const { width, height } = currentNode.absoluteBoundingBox;
      if (width && !mapSizeToTailwind(width, 'w')) {
        customStyles.push(`.figma-${className} { width: ${width}px; }`);
      }
      if (height && !mapSizeToTailwind(height, 'h')) {
        customStyles.push(`.figma-${className} { height: ${height}px; }`);
      }
    }
    
    currentNode.children?.forEach(collectCustomStyles);
  };
  
  collectCustomStyles(node);
  return customStyles.join('\n');
};

const generateTailwindConfig = (data: ProcessedFigmaData): string => {
  return `/*
Tailwind Config Suggestions:

module.exports = {
  theme: {
    extend: {
      // Add custom colors found in your design
      colors: {
        'figma-primary': '#your-primary-color',
        'figma-secondary': '#your-secondary-color',
      },
      
      // Add custom spacing values
      spacing: {
        'figma-xs': '4px',
        'figma-sm': '8px',
        'figma-md': '16px',
        'figma-lg': '24px',
        'figma-xl': '32px',
      },
      
      // Add custom font families
      fontFamily: {
        'figma': ['YourCustomFont', 'sans-serif'],
      }
    }
  }
}
*/`;
};

// Helper functions
const getHTMLTag = (nodeType: string): string => {
  switch (nodeType) {
    case 'TEXT': return 'span';
    case 'RECTANGLE': return 'div';
    case 'ELLIPSE': return 'div';
    case 'FRAME': return 'div';
    case 'GROUP': return 'div';
    case 'COMPONENT': return 'div';
    case 'INSTANCE': return 'div';
    default: return 'div';
  }
};

const sanitizeClassName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const red = Math.round(r * 255);
  const green = Math.round(g * 255);
  const blue = Math.round(b * 255);
  
  return '#' + [red, green, blue].map(x => 
    x.toString(16).padStart(2, '0')
  ).join('');
};