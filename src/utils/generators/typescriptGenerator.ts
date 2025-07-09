
import { GeneratedCode } from '../types';

export const generateTypeScriptInterfaces = (structure: GeneratedCode): string => {
  const colors = extractColors(structure.mainComponent);
  const componentProps = extractComponentPropTypes(structure.mainComponent);

  return `// Auto-generated TypeScript interfaces
interface FigmaColors {
${colors.map(color => `  '${color.name}': '${color.value}';`).join('\n')}
}

interface ComponentProps {
${componentProps.map(prop => `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.type};`).join('\n')}
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: any[];
  effects?: any[];
  style?: any;
}

export { FigmaColors, ComponentProps, FigmaNode };`;
};

const extractColors = (node: any): Array<{ name: string; value: string }> => {
  const colors: Array<{ name: string; value: string }> = [];
  const colorMap = new Map<string, number>();

  const traverse = (n: any) => {
    if (n.fills) {
      n.fills.forEach((fill: any) => {
        if (fill.type === 'SOLID' && fill.color) {
          const { r, g, b } = fill.color;
          const hex = `#${[r, g, b].map(x => 
            Math.round(x * 255).toString(16).padStart(2, '0')
          ).join('')}`;
          
          const count = colorMap.get(hex) || 0;
          colorMap.set(hex, count + 1);
        }
      });
    }

    if (n.children) {
      n.children.forEach(traverse);
    }
  };

  traverse(node);

  Array.from(colorMap.entries()).forEach(([hex, count], index) => {
    colors.push({
      name: `color${index + 1}`,
      value: hex
    });
  });

  return colors;
};

const extractComponentPropTypes = (node: any): Array<{ name: string; type: string; optional: boolean }> => {
  const props: Array<{ name: string; type: string; optional: boolean }> = [];

  if (node?.componentPropertyDefinitions) {
    Object.entries(node.componentPropertyDefinitions).forEach(([key, prop]: [string, any]) => {
      props.push({
        name: key.replace(/[^a-zA-Z0-9]/g, ''),
        type: prop.type === 'BOOLEAN' ? 'boolean' : 'string',
        optional: prop.defaultValue !== undefined
      });
    });
  }

  return props;
};
