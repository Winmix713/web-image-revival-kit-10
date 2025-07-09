import { ProcessedFigmaData, GenerationOptions } from '../../types';

export const generateReactComponent = (data: ProcessedFigmaData, options: GenerationOptions): string => {
  const componentName = sanitizeComponentName(data.metaData.name);
  const { imports, interfaces, component, exports } = buildReactComponent(data, options);

  return `${imports}

${interfaces}

${component}

${exports}`;
};

const sanitizeComponentName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, (str: string) => str.toUpperCase());
};

const buildReactComponent = (data: ProcessedFigmaData, options: GenerationOptions) => {
  const componentName = sanitizeComponentName(data.metaData.name);
  
  const imports = generateImports(options);
  const interfaces = generateInterfaces(data, componentName, options);
  const component = generateComponentCode(data, componentName, options);
  const exports = generateExports(componentName);

  return { imports, interfaces, component, exports };
};

const generateImports = (options: GenerationOptions): string => {
  const imports = ["import React from 'react';"];
  
  if (options.includeTypes) {
    imports.push("import { CSSProperties } from 'react';");
  }
  
  return imports.join('\n');
};

const generateInterfaces = (data: ProcessedFigmaData, componentName: string, options: GenerationOptions): string => {
  if (!options.includeTypes) return '';

  const props = extractComponentProps(data.processedDocument);
  
  return `interface ${componentName}Props {
${props.map(prop => `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.type};`).join('\n')}
  className?: string;
  style?: CSSProperties;
}`;
};

const generateComponentCode = (data: ProcessedFigmaData, componentName: string, options: GenerationOptions): string => {
  const jsx = generateJSX(data.processedDocument, 1);
  const propsType = options.includeTypes ? `: React.FC<${componentName}Props>` : '';
  
  return `export const ${componentName}${propsType} = ({ className, style, ...props }) => {
  return (
    <div className={\`figma-${componentName.toLowerCase()} \${className || ''}\`} style={style}>
${jsx}
    </div>
  );
};`;
};

const generateJSX = (node: any, depth: number): string => {
  if (!node) return '';

  const indent = '  '.repeat(depth + 1);
  const tagName = getJSXTagName(node.type);
  const props = generateJSXProps(node);
  
  let jsx = `${indent}<${tagName}${props}`;

  if (node.children && node.children.length > 0) {
    jsx += '>\n';
    jsx += node.children.map((child: any) => generateJSX(child, depth + 1)).join('\n');
    jsx += `\n${indent}</${tagName}>`;
  } else if (node.type === 'TEXT' && node.characters) {
    jsx += `>\n${indent}  {${JSON.stringify(node.characters)}}\n${indent}</${tagName}>`;
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
    case 'COMPONENT': return 'div';
    case 'INSTANCE': return 'div';
    default: return 'div';
  }
};

const generateJSXProps = (node: any): string => {
  const props: string[] = [];
  
  if (node.name) {
    props.push(`data-figma-name="${node.name}"`);
  }

  // Add className based on node properties
  const classNames: string[] = [];
  if (node.type) {
    classNames.push(`figma-${node.type.toLowerCase()}`);
  }
  if (node.id) {
    classNames.push(`figma-id-${node.id.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }
  
  if (classNames.length > 0) {
    props.push(`className="${classNames.join(' ')}"`);
  }

  return props.length > 0 ? ` ${props.join(' ')}` : '';
};

const extractComponentProps = (node: any): Array<{ name: string; type: string; optional: boolean }> => {
  const props: Array<{ name: string; type: string; optional: boolean }> = [];

  if (node?.componentPropertyDefinitions) {
    Object.entries(node.componentPropertyDefinitions).forEach(([key, prop]: [string, any]) => {
      props.push({
        name: key.replace(/[^a-zA-Z0-9]/g, ''),
        type: getTypeScriptType(prop.type),
        optional: prop.defaultValue !== undefined
      });
    });
  }

  return props;
};

const getTypeScriptType = (figmaType: string): string => {
  switch (figmaType) {
    case 'BOOLEAN': return 'boolean';
    case 'TEXT': return 'string';
    case 'INSTANCE_SWAP': return 'React.ReactNode';
    case 'VARIANT': return 'string';
    default: return 'string';
  }
};

const generateExports = (componentName: string): string => {
  return `export default ${componentName};`;
};