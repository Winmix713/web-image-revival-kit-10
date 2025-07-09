
import { FigmaApiResponse } from '../../../types/figma';
import { ProcessedFigmaData, ProcessedNode } from '../types';

export interface ExtractedComponent {
  id: string;
  name: string;
  type: string;
  description?: string;
  properties: Record<string, any>;
  variants?: string[];
  instances: number;
  children: ProcessedNode[];
}

export interface ExtractedStyle {
  id: string;
  name: string;
  type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  value: any;
  cssValue: string;
  usage: string[];
}

export interface DesignSystem {
  colors: Record<string, string>;
  typography: Record<string, any>;
  spacing: number[];
  effects: Record<string, string>;
  components: ExtractedComponent[];
  styles: ExtractedStyle[];
}

export class EnhancedDataProcessor {
  static processAdvancedFigmaData(figmaData: FigmaApiResponse, fileKey: string): ProcessedFigmaData & {
    designSystem: DesignSystem;
    extractedComponents: ExtractedComponent[];
    extractedStyles: ExtractedStyle[];
  } {
    const processedDocument = this.processNodeWithMetadata(figmaData.document);
    const extractedComponents = this.extractComponents(figmaData);
    const extractedStyles = this.extractStyles(figmaData);
    const designSystem = this.generateDesignSystem(figmaData, extractedComponents, extractedStyles);

    return {
      metaData: {
        fileKey,
        name: figmaData.name,
        lastModified: figmaData.lastModified,
        version: figmaData.version,
        role: figmaData.role,
        editorType: figmaData.editorType,
        thumbnailUrl: figmaData.thumbnailUrl
      },
      processedDocument,
      components: figmaData.components,
      styles: figmaData.styles,
      designSystem,
      extractedComponents,
      extractedStyles
    };
  }

  private static processNodeWithMetadata(node: any, depth = 0): ProcessedNode {
    const processed: ProcessedNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      depth,
      fills: node.fills,
      effects: node.effects,
      absoluteBoundingBox: node.absoluteBoundingBox,
      constraints: node.constraints,
      characters: node.characters,
      style: node.style
    };

    if (node.children) {
      processed.children = node.children.map((child: any) => 
        this.processNodeWithMetadata(child, depth + 1)
      );
    }

    return processed;
  }

  private static extractComponents(figmaData: FigmaApiResponse): ExtractedComponent[] {
    const components: ExtractedComponent[] = [];
    const componentInstances = new Map<string, number>();

    // Count component instances
    this.traverseNode(figmaData.document, (node) => {
      if (node.type === 'INSTANCE' && node.componentId) {
        const count = componentInstances.get(node.componentId) || 0;
        componentInstances.set(node.componentId, count + 1);
      }
    });

    // Extract component definitions
    Object.entries(figmaData.components || {}).forEach(([id, component]: [string, any]) => {
      components.push({
        id,
        name: component.name,
        type: component.type,
        description: component.description,
        properties: component.componentPropertyDefinitions || {},
        variants: this.extractVariants(component),
        instances: componentInstances.get(id) || 0,
        children: component.children ? component.children.map((child: any) => 
          this.processNodeWithMetadata(child)
        ) : []
      });
    });

    return components;
  }

  private static extractStyles(figmaData: FigmaApiResponse): ExtractedStyle[] {
    const styles: ExtractedStyle[] = [];
    const styleUsage = new Map<string, string[]>();

    // Track style usage
    this.traverseNode(figmaData.document, (node) => {
      if (node.styles) {
        Object.entries(node.styles).forEach(([property, styleId]) => {
          const usage = styleUsage.get(styleId as string) || [];
          usage.push(`${node.name || 'Unnamed'} (${property})`);
          styleUsage.set(styleId as string, usage);
        });
      }
    });

    // Extract style definitions
    Object.entries(figmaData.styles || {}).forEach(([id, style]: [string, any]) => {
      styles.push({
        id,
        name: style.name,
        type: style.styleType,
        value: this.getStyleValue(style),
        cssValue: this.convertToCSSValue(style),
        usage: styleUsage.get(id) || []
      });
    });

    return styles;
  }

  private static generateDesignSystem(
    figmaData: FigmaApiResponse, 
    components: ExtractedComponent[], 
    styles: ExtractedStyle[]
  ): DesignSystem {
    return {
      colors: this.extractColors(figmaData, styles),
      typography: this.extractTypography(figmaData, styles),
      spacing: this.extractSpacing(figmaData),
      effects: this.extractEffects(figmaData, styles),
      components,
      styles
    };
  }

  private static extractColors(figmaData: FigmaApiResponse, styles: ExtractedStyle[]): Record<string, string> {
    const colors: Record<string, string> = {};
    
    styles.filter(style => style.type === 'FILL').forEach(style => {
      if (style.cssValue) {
        colors[this.sanitizeName(style.name)] = style.cssValue;
      }
    });

    // Also extract colors from fills in the document
    const documentColors = new Set<string>();
    this.traverseNode(figmaData.document, (node) => {
      if (node.fills) {
        node.fills.forEach((fill: any) => {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b, a = 1 } = fill.color;
            const cssColor = `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a})`;
            documentColors.add(cssColor);
          }
        });
      }
    });

    Array.from(documentColors).forEach((color, index) => {
      colors[`color-${index + 1}`] = color;
    });

    return colors;
  }

  private static extractTypography(figmaData: FigmaApiResponse, styles: ExtractedStyle[]): Record<string, any> {
    const typography: Record<string, any> = {};
    
    styles.filter(style => style.type === 'TEXT').forEach(style => {
      typography[this.sanitizeName(style.name)] = style.value;
    });

    return typography;
  }

  private static extractSpacing(figmaData: FigmaApiResponse): number[] {
    const spacingSet = new Set<number>();
    
    this.traverseNode(figmaData.document, (node) => {
      // Extract spacing from padding and item spacing
      ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing'].forEach(prop => {
        if (node[prop] !== undefined && node[prop] > 0) {
          spacingSet.add(node[prop]);
        }
      });
    });

    return Array.from(spacingSet).sort((a, b) => a - b);
  }

  private static extractEffects(figmaData: FigmaApiResponse, styles: ExtractedStyle[]): Record<string, string> {
    const effects: Record<string, string> = {};
    
    styles.filter(style => style.type === 'EFFECT').forEach(style => {
      effects[this.sanitizeName(style.name)] = style.cssValue;
    });

    return effects;
  }

  private static traverseNode(node: any, callback: (node: any) => void): void {
    callback(node);
    if (node.children) {
      node.children.forEach((child: any) => this.traverseNode(child, callback));
    }
  }

  private static extractVariants(component: any): string[] {
    const variants: string[] = [];
    if (component.componentPropertyDefinitions) {
      Object.entries(component.componentPropertyDefinitions).forEach(([key, prop]: [string, any]) => {
        if (prop.type === 'VARIANT' && prop.variantOptions) {
          variants.push(...prop.variantOptions);
        }
      });
    }
    return variants;
  }

  private static getStyleValue(style: any): any {
    switch (style.styleType) {
      case 'FILL':
        return style.fills?.[0];
      case 'TEXT':
        return style.style;
      case 'EFFECT':
        return style.effects?.[0];
      default:
        return style;
    }
  }

  private static convertToCSSValue(style: any): string {
    switch (style.styleType) {
      case 'FILL':
        const fill = style.fills?.[0];
        if (fill?.type === 'SOLID' && fill.color) {
          const { r, g, b, a = 1 } = fill.color;
          return `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a})`;
        }
        break;
      case 'TEXT':
        const textStyle = style.style;
        if (textStyle) {
          return `${textStyle.fontSize || 16}px ${textStyle.fontFamily || 'inherit'}`;
        }
        break;
      case 'EFFECT':
        const effect = style.effects?.[0];
        if (effect?.type === 'DROP_SHADOW') {
          const { r, g, b, a = 1 } = effect.color || { r: 0, g: 0, b: 0, a: 1 };
          const color = `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a})`;
          return `${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${color}`;
        }
        break;
    }
    return '';
  }

  private static sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
