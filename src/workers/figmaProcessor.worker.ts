// Web Worker for processing large Figma files
interface ProcessMessage {
  type: 'PROCESS_FIGMA' | 'VALIDATE_DATA' | 'GENERATE_CODE';
  data: any;
  options?: any;
}

interface ProcessResult {
  type: 'PROCESS_COMPLETE' | 'VALIDATION_COMPLETE' | 'GENERATION_COMPLETE' | 'ERROR';
  result?: any;
  error?: string;
}

class FigmaProcessor {
  processLargeFigmaFile(data: any): any {
    try {
      // Deep process the Figma data structure
      const processed = this.deepProcessNode(data.document);
      
      return {
        processedDocument: processed,
        statistics: this.calculateStatistics(processed),
        complexity: this.calculateComplexity(processed),
        performance: {
          nodeCount: this.countNodes(processed),
          processingTime: Date.now()
        }
      };
    } catch (error) {
      throw new Error(`Processing failed: ${error}`);
    }
  }

  private deepProcessNode(node: any, depth = 0): any {
    if (!node) return null;

    const processed = {
      ...node,
      depth,
      processedAt: Date.now(),
      
      // Add computed properties
      hasChildren: !!(node.children && node.children.length > 0),
      childrenCount: node.children ? node.children.length : 0,
      
      // Process visual properties
      computedStyles: this.computeStyles(node),
      
      // Process layout properties
      layoutInfo: this.extractLayoutInfo(node),
      
      // Process children recursively
      children: node.children ? 
        node.children.map((child: any) => this.deepProcessNode(child, depth + 1)) : 
        undefined
    };

    return processed;
  }

  private computeStyles(node: any): any {
    const styles: any = {};

    // Process fills
    if (node.fills) {
      styles.fills = node.fills.map((fill: any) => ({
        ...fill,
        computed: this.computeFillValue(fill)
      }));
    }

    // Process effects
    if (node.effects) {
      styles.effects = node.effects.map((effect: any) => ({
        ...effect,
        cssEquivalent: this.effectToCss(effect)
      }));
    }

    // Process typography
    if (node.style) {
      styles.typography = {
        ...node.style,
        cssEquivalent: this.typographyToCss(node.style)
      };
    }

    return styles;
  }

  private computeFillValue(fill: any): string {
    if (fill.type === 'SOLID' && fill.color) {
      const { r, g, b, a = 1 } = fill.color;
      return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
    return 'transparent';
  }

  private effectToCss(effect: any): string {
    switch (effect.type) {
      case 'DROP_SHADOW':
        return `drop-shadow(${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${this.computeFillValue({ type: 'SOLID', color: effect.color })})`;
      case 'INNER_SHADOW':
        return `inset ${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${this.computeFillValue({ type: 'SOLID', color: effect.color })}`;
      case 'LAYER_BLUR':
        return `blur(${effect.radius || 0}px)`;
      case 'BACKGROUND_BLUR':
        return `backdrop-blur(${effect.radius || 0}px)`;
      default:
        return '';
    }
  }

  private typographyToCss(style: any): any {
    return {
      fontFamily: style.fontFamily || 'inherit',
      fontSize: `${style.fontSize || 16}px`,
      fontWeight: style.fontWeight || 'normal',
      lineHeight: style.lineHeightPx ? `${style.lineHeightPx}px` : 'normal',
      letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : 'normal',
      textAlign: style.textAlignHorizontal?.toLowerCase() || 'left'
    };
  }

  private extractLayoutInfo(node: any): any {
    return {
      layoutMode: node.layoutMode,
      itemSpacing: node.itemSpacing,
      padding: {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0
      },
      constraints: node.constraints,
      absoluteBounds: node.absoluteBoundingBox
    };
  }

  private calculateStatistics(node: any): any {
    const stats = {
      totalNodes: 0,
      nodeTypes: {} as Record<string, number>,
      textNodes: 0,
      componentInstances: 0,
      maxDepth: 0,
      colors: new Set<string>(),
      fonts: new Set<string>()
    };

    const traverse = (n: any, depth = 0) => {
      stats.totalNodes++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      
      // Count node types
      stats.nodeTypes[n.type] = (stats.nodeTypes[n.type] || 0) + 1;
      
      // Count specific types
      if (n.type === 'TEXT') stats.textNodes++;
      if (n.type === 'INSTANCE') stats.componentInstances++;
      
      // Collect colors
      if (n.computedStyles?.fills) {
        n.computedStyles.fills.forEach((fill: any) => {
          if (fill.computed !== 'transparent') {
            stats.colors.add(fill.computed);
          }
        });
      }
      
      // Collect fonts
      if (n.computedStyles?.typography?.fontFamily) {
        stats.fonts.add(n.computedStyles.typography.fontFamily);
      }
      
      if (n.children) {
        n.children.forEach((child: any) => traverse(child, depth + 1));
      }
    };

    traverse(node);

    return {
      ...stats,
      colors: Array.from(stats.colors),
      fonts: Array.from(stats.fonts)
    };
  }

  private calculateComplexity(node: any): string {
    const stats = this.calculateStatistics(node);
    const score = stats.totalNodes + (stats.maxDepth * 2) + (stats.componentInstances * 3);
    
    if (score < 20) return 'low';
    if (score < 50) return 'medium';
    return 'high';
  }

  private countNodes(node: any): number {
    let count = 1;
    if (node.children) {
      count += node.children.reduce((sum: number, child: any) => sum + this.countNodes(child), 0);
    }
    return count;
  }
}

const processor = new FigmaProcessor();

self.onmessage = (event: MessageEvent<ProcessMessage>) => {
  const { type, data, options } = event.data;

  try {
    let result: any;

    switch (type) {
      case 'PROCESS_FIGMA':
        result = processor.processLargeFigmaFile(data);
        break;
      case 'VALIDATE_DATA':
        result = { isValid: true, errors: [] }; // Implement validation logic
        break;
      case 'GENERATE_CODE':
        result = { code: 'Generated code here' }; // Implement code generation
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const response: ProcessResult = {
      type: `${type.split('_')[0]}_COMPLETE` as any,
      result
    };

    self.postMessage(response);
  } catch (error) {
    const errorResponse: ProcessResult = {
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    self.postMessage(errorResponse);
  }
};