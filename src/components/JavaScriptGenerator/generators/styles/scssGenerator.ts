import { ProcessedFigmaData, GenerationOptions } from '../../types';
import { generateCSS } from './cssGenerator';

export const generateSCSS = (data: ProcessedFigmaData, options: GenerationOptions): string => {
  const { processedDocument } = data;
  const styles: string[] = [];
  
  // Add header comment
  styles.push(`// SCSS Generated from Figma Design: ${data.metaData.name}`);
  styles.push(`// Generated on: ${new Date().toISOString()}\n`);
  
  // Generate SCSS variables for design tokens
  styles.push(generateSCSSVariables(data));
  
  // Generate mixins
  styles.push(generateSCSSMixins());
  
  // Generate component styles with nesting
  generateNodeSCSS(processedDocument, styles, options);
  
  return styles.join('\n');
};

const generateSCSSVariables = (data: ProcessedFigmaData): string => {
  const variables: string[] = ['// Design Variables'];
  
  // Extract colors and create SCSS variables
  const colorMap = new Map<string, string>();
  const spacingMap = new Map<number, string>();
  
  extractDesignTokens(data.processedDocument, colorMap, spacingMap);
  
  // Color variables
  if (colorMap.size > 0) {
    variables.push('\n// Colors');
    Array.from(colorMap.entries()).forEach(([color, name], index) => {
      variables.push(`$${name}: ${color};`);
    });
  }
  
  // Spacing variables
  if (spacingMap.size > 0) {
    variables.push('\n// Spacing');
    Array.from(spacingMap.entries()).forEach(([value, name]) => {
      variables.push(`$${name}: ${value}px;`);
    });
  }
  
  // Default variables
  variables.push(`
// Default values
$figma-border-radius: 4px;
$figma-transition: all 0.3s ease;
$figma-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);`);
  
  return variables.join('\n') + '\n';
};

const generateSCSSMixins = (): string => {
  return `
// Mixins
@mixin figma-flex($direction: row, $align: flex-start, $justify: flex-start) {
  display: flex;
  flex-direction: $direction;
  align-items: $align;
  justify-content: $justify;
}

@mixin figma-text($family: inherit, $size: 16px, $weight: normal, $line-height: 1.2) {
  font-family: $family;
  font-size: $size;
  font-weight: $weight;
  line-height: $line-height;
}

@mixin figma-button($bg: #007bff, $color: white, $padding: 8px 16px) {
  background-color: $bg;
  color: $color;
  padding: $padding;
  border: none;
  border-radius: $figma-border-radius;
  cursor: pointer;
  transition: $figma-transition;
  
  &:hover {
    background-color: darken($bg, 10%);
  }
  
  &:active {
    transform: translateY(1px);
  }
}

@mixin figma-card($padding: 16px, $shadow: $figma-shadow) {
  background: white;
  padding: $padding;
  border-radius: $figma-border-radius;
  box-shadow: $shadow;
}

@mixin figma-responsive($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: 767px) { @content; }
  }
  @if $breakpoint == tablet {
    @media (min-width: 768px) and (max-width: 1023px) { @content; }
  }
  @if $breakpoint == desktop {
    @media (min-width: 1024px) { @content; }
  }
}
`;
};

const generateNodeSCSS = (node: any, styles: string[], options: GenerationOptions, depth = 0) => {
  if (!node) return;
  
  const className = sanitizeClassName(node.name || `element-${node.id}`);
  const selector = `.figma-${className}`;
  const indent = '  '.repeat(depth);
  
  let scss = `${indent}${selector} {\n`;
  
  // Layout properties with SCSS features
  if (node.absoluteBoundingBox) {
    const { width, height } = node.absoluteBoundingBox;
    if (width) scss += `${indent}  width: ${width}px;\n`;
    if (height) scss += `${indent}  height: ${height}px;\n`;
  }
  
  // Use mixins for flex layouts
  if (node.layoutMode) {
    const direction = node.layoutMode === 'VERTICAL' ? 'column' : 'row';
    const align = mapFigmaAlignment(node.counterAxisAlignItems || 'MIN');
    const justify = mapFigmaAlignment(node.primaryAxisAlignItems || 'MIN');
    
    scss += `${indent}  @include figma-flex(${direction}, ${align}, ${justify});\n`;
    
    if (node.itemSpacing) {
      scss += `${indent}  gap: ${node.itemSpacing}px;\n`;
    }
  }
  
  // Background with SCSS color functions
  if (node.fills && node.fills.length > 0) {
    const background = generateSCSSBackground(node.fills, indent);
    if (background) scss += background;
  }
  
  // Typography using mixins
  if (node.type === 'TEXT' && node.style) {
    scss += generateSCSSTypography(node.style, indent);
  }
  
  // Hover states and interactions
  if (isInteractiveElement(node)) {
    scss += generateInteractionStates(indent);
  }
  
  // Responsive behavior
  if (options.includeHelpers && hasResponsiveProperties(node)) {
    scss += generateResponsiveStyles(node, indent);
  }
  
  scss += `${indent}}\n\n`;
  
  // Only add if there are actual styles
  if (scss.split('\n').length > 3) {
    styles.push(scss);
  }
  
  // Process children with nesting
  if (node.children && node.children.length > 0) {
    node.children.forEach((child: any) => {
      generateNodeSCSS(child, styles, options, depth);
    });
  }
};

const generateSCSSBackground = (fills: any[], indent: string): string => {
  const fill = fills[0];
  let scss = '';
  
  switch (fill.type) {
    case 'SOLID':
      if (fill.color) {
        const color = rgbaToSCSSColor(fill.color);
        scss += `${indent}  background-color: ${color};\n`;
      }
      break;
      
    case 'GRADIENT_LINEAR':
      if (fill.gradientStops) {
        const gradient = generateSCSSGradient(fill);
        scss += `${indent}  background: ${gradient};\n`;
      }
      break;
  }
  
  return scss;
};

const generateSCSSTypography = (style: any, indent: string): string => {
  const family = style.fontFamily ? `'${style.fontFamily}'` : 'inherit';
  const size = style.fontSize ? `${style.fontSize}px` : '16px';
  const weight = style.fontWeight || 'normal';
  const lineHeight = style.lineHeightPx ? `${style.lineHeightPx}px` : '1.2';
  
  return `${indent}  @include figma-text(${family}, ${size}, ${weight}, ${lineHeight});\n`;
};

const generateInteractionStates = (indent: string): string => {
  return `${indent}  cursor: pointer;
${indent}  transition: $figma-transition;
${indent}  
${indent}  &:hover {
${indent}    transform: translateY(-2px);
${indent}    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
${indent}  }
${indent}  
${indent}  &:active {
${indent}    transform: translateY(0);
${indent}  }
`;
};

const generateResponsiveStyles = (node: any, indent: string): string => {
  let responsive = '';
  
  // Add mobile-first responsive behavior
  if (node.absoluteBoundingBox) {
    responsive += `${indent}  
${indent}  @include figma-responsive(mobile) {
${indent}    width: 100%;
${indent}    max-width: none;
${indent}  }
${indent}  
${indent}  @include figma-responsive(tablet) {
${indent}    width: 100%;
${indent}  }
`;
  }
  
  return responsive;
};

const generateSCSSGradient = (fill: any): string => {
  const angle = calculateGradientAngle(fill.gradientTransform);
  const stops = fill.gradientStops.map((stop: any) => {
    const color = rgbaToSCSSColor(stop.color);
    return `${color} ${Math.round(stop.position * 100)}%`;
  }).join(', ');
  
  return `linear-gradient(${angle}deg, ${stops})`;
};

// Helper functions
const extractDesignTokens = (node: any, colorMap: Map<string, string>, spacingMap: Map<number, string>) => {
  if (!node) return;
  
  // Extract colors
  if (node.fills) {
    node.fills.forEach((fill: any, index: number) => {
      if (fill.type === 'SOLID' && fill.color) {
        const color = rgbaToSCSSColor(fill.color);
        const name = sanitizeVariableName(`${node.name || 'color'}-${index}`);
        colorMap.set(color, name);
      }
    });
  }
  
  // Extract spacing
  if (node.itemSpacing !== undefined) {
    const name = sanitizeVariableName(`spacing-${node.itemSpacing}`);
    spacingMap.set(node.itemSpacing, name);
  }
  
  // Recursively process children
  if (node.children) {
    node.children.forEach((child: any) => extractDesignTokens(child, colorMap, spacingMap));
  }
};

const rgbaToSCSSColor = (color: any): string => {
  const { r, g, b, a = 1 } = color;
  const red = Math.round(r * 255);
  const green = Math.round(g * 255);
  const blue = Math.round(b * 255);
  
  if (a === 1) {
    return `rgb(${red}, ${green}, ${blue})`;
  }
  return `rgba(${red}, ${green}, ${blue}, ${a})`;
};

const sanitizeClassName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const sanitizeVariableName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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

const isInteractiveElement = (node: any): boolean => {
  return node.type === 'INSTANCE' || 
         node.name?.toLowerCase().includes('button') ||
         node.name?.toLowerCase().includes('link') ||
         node.componentPropertyDefinitions;
};

const hasResponsiveProperties = (node: any): boolean => {
  return node.absoluteBoundingBox && 
         (node.absoluteBoundingBox.width > 600 || node.layoutMode);
};

const calculateGradientAngle = (gradientTransform: number[][]): number => {
  if (gradientTransform && gradientTransform.length >= 2) {
    const [a, b] = gradientTransform;
    if (a && b) {
      const angle = Math.atan2(b[1], a[0]) * (180 / Math.PI);
      return Math.round(angle);
    }
  }
  return 0;
};