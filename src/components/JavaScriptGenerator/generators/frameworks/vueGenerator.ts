import { ProcessedFigmaData, GenerationOptions } from '../../types';

export const generateVueComponent = (data: ProcessedFigmaData, options: GenerationOptions): string => {
  const componentName = sanitizeComponentName(data.metaData.name);
  const { template, script, style } = buildVueComponent(data, options);

  return `<template>
${template}
</template>

<script${options.includeTypes ? ' lang="ts"' : ''}>
${script}
</script>

<style scoped>
${style}
</style>`;
};

const sanitizeComponentName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, (str: string) => str.toUpperCase());
};

const buildVueComponent = (data: ProcessedFigmaData, options: GenerationOptions) => {
  const template = generateTemplate(data.processedDocument, 1);
  const script = generateScript(data, options);
  const style = generateStyle(data.processedDocument);

  return { template, script, style };
};

const generateTemplate = (node: any, depth: number): string => {
  if (!node) return '';

  const indent = '  '.repeat(depth);
  const tagName = getVueTagName(node.type);
  const props = generateVueProps(node);
  
  let template = `${indent}<${tagName}${props}`;

  if (node.children && node.children.length > 0) {
    template += '>\n';
    template += node.children.map((child: any) => generateTemplate(child, depth + 1)).join('\n');
    template += `\n${indent}</${tagName}>`;
  } else if (node.type === 'TEXT' && node.characters) {
    template += `>\n${indent}  {{ ${JSON.stringify(node.characters)} }}\n${indent}</${tagName}>`;
  } else {
    template += ' />';
  }

  return template;
};

const getVueTagName = (nodeType: string): string => {
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

const generateVueProps = (node: any): string => {
  const props: string[] = [];
  
  if (node.name) {
    props.push(`:data-figma-name="${JSON.stringify(node.name)}"`);
  }

  // Add class based on node properties
  const classNames: string[] = [];
  if (node.type) {
    classNames.push(`figma-${node.type.toLowerCase()}`);
  }
  if (node.id) {
    classNames.push(`figma-id-${node.id.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }
  
  if (classNames.length > 0) {
    props.push(`class="${classNames.join(' ')}"`);
  }

  return props.length > 0 ? ` ${props.join(' ')}` : '';
};

const generateScript = (data: ProcessedFigmaData, options: GenerationOptions): string => {
  const componentName = sanitizeComponentName(data.metaData.name);
  const props = extractVueProps(data.processedDocument);
  
  if (options.includeTypes) {
    return generateTypeScriptScript(componentName, props);
  } else {
    return generateJavaScriptScript(componentName, props);
  }
};

const generateTypeScriptScript = (componentName: string, props: any[]): string => {
  const propsInterface = props.length > 0 ? generatePropsInterface(props) : '';
  
  return `import { defineComponent } from 'vue';

${propsInterface}

export default defineComponent({
  name: '${componentName}',
  props: {
${props.map(prop => `    ${prop.name}: {
      type: ${getVueType(prop.type)},
      ${prop.optional ? 'required: false' : 'required: true'}
    }`).join(',\n')}
  },
  setup(props) {
    return {
      // Add reactive state here if needed
    };
  }
});`;
};

const generateJavaScriptScript = (componentName: string, props: any[]): string => {
  return `export default {
  name: '${componentName}',
  props: {
${props.map(prop => `    ${prop.name}: {
      type: ${getVueType(prop.type)},
      ${prop.optional ? 'required: false' : 'required: true'}
    }`).join(',\n')}
  },
  data() {
    return {
      // Add component data here if needed
    };
  }
};`;
};

const generatePropsInterface = (props: any[]): string => {
  return `interface Props {
${props.map(prop => `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.type};`).join('\n')}
}`;
};

const extractVueProps = (node: any): Array<{ name: string; type: string; optional: boolean }> => {
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

const getVueType = (type: string): string => {
  switch (type) {
    case 'boolean': return 'Boolean';
    case 'string': return 'String';
    case 'number': return 'Number';
    default: return 'String';
  }
};

const getTypeScriptType = (figmaType: string): string => {
  switch (figmaType) {
    case 'BOOLEAN': return 'boolean';
    case 'TEXT': return 'string';
    case 'INSTANCE_SWAP': return 'any';
    case 'VARIANT': return 'string';
    default: return 'string';
  }
};

const generateStyle = (node: any): string => {
  const styles: string[] = [];
  
  const collectStyles = (currentNode: any, depth = 0) => {
    if (!currentNode) return;
    
    const className = `figma-${currentNode.type?.toLowerCase() || 'element'}`;
    let css = `.${className} {\n`;
    
    // Background
    if (currentNode.fills?.[0]?.type === 'SOLID') {
      const { r, g, b, a = 1 } = currentNode.fills[0].color;
      css += `  background-color: rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a});\n`;
    }

    // Border radius
    if (currentNode.cornerRadius) {
      css += `  border-radius: ${currentNode.cornerRadius}px;\n`;
    }

    // Padding
    if (currentNode.paddingTop || currentNode.paddingRight || currentNode.paddingBottom || currentNode.paddingLeft) {
      const top = currentNode.paddingTop || 0;
      const right = currentNode.paddingRight || 0;
      const bottom = currentNode.paddingBottom || 0;
      const left = currentNode.paddingLeft || 0;
      css += `  padding: ${top}px ${right}px ${bottom}px ${left}px;\n`;
    }

    // Typography
    if (currentNode.style) {
      if (currentNode.style.fontFamily) {
        css += `  font-family: '${currentNode.style.fontFamily}';\n`;
      }
      if (currentNode.style.fontSize) {
        css += `  font-size: ${currentNode.style.fontSize}px;\n`;
      }
      if (currentNode.style.fontWeight) {
        css += `  font-weight: ${currentNode.style.fontWeight};\n`;
      }
    }

    css += '}\n';
    styles.push(css);
    
    currentNode.children?.forEach((child: any) => collectStyles(child, depth + 1));
  };
  
  collectStyles(node);
  return styles.join('\n');
};