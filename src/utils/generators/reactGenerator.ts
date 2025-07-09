
import { GeneratedCode } from '../types';

export const generateReactComponent = (structure: GeneratedCode): string => {
  const componentName = structure.metaData.name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, (str: string) => str.toUpperCase());

  const props = extractComponentPropTypes(structure.mainComponent);
  const jsx = generateJSXFromStructure(structure.mainComponent);

  return `import React from 'react';

interface ${componentName}Props {
${props.map(prop => `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.type};`).join('\n')}
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
${jsx}
  );
};

export default ${componentName};`;
};

const generateJSXFromStructure = (node: any, depth = 1): string => {
  if (!node) return '';

  const indent = '  '.repeat(depth);
  const tagName = getJSXTagName(node.type);
  const props = generateJSXProps(node);
  
  let jsx = `${indent}<${tagName}${props}`;

  if (node.children && node.children.length > 0) {
    jsx += '>\n';
    jsx += node.children.map((child: any) => generateJSXFromStructure(child, depth + 1)).join('\n');
    jsx += `\n${indent}</${tagName}>`;
  } else if (node.type === 'TEXT' && node.characters) {
    jsx += `>${node.characters}</${tagName}>`;
  } else {
    jsx += ' />';
  }

  return jsx;
};

const getJSXTagName = (nodeType: string): string => {
  switch (nodeType) {
    case 'TEXT': return 'span';
    case 'RECTANGLE': return 'div';
    case 'ELLIPSE': return 'div';
    case 'FRAME': return 'div';
    case 'GROUP': return 'div';
    default: return 'div';
  }
};

const generateJSXProps = (node: any): string => {
  const props: string[] = [];
  
  if (node.name) {
    props.push(`data-name="${node.name}"`);
  }

  // Add className based on node properties
  const classNames: string[] = [];
  if (node.type) {
    classNames.push(`figma-${node.type.toLowerCase()}`);
  }
  if (classNames.length > 0) {
    props.push(`className="${classNames.join(' ')}"`);
  }

  return props.length > 0 ? ` ${props.join(' ')}` : '';
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
