
export const generateCSS = (node: any, className: string): string => {
  let css = `.${className} {\n`;

  // Background
  if (node.fills?.[0]?.type === 'SOLID') {
    const { r, g, b, a = 1 } = node.fills[0].color;
    css += `  background-color: rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a});\n`;
  }

  // Border radius
  if (node.cornerRadius) {
    css += `  border-radius: ${node.cornerRadius}px;\n`;
  }

  // Padding
  if (node.paddingTop || node.paddingRight || node.paddingBottom || node.paddingLeft) {
    const top = node.paddingTop || 0;
    const right = node.paddingRight || 0;
    const bottom = node.paddingBottom || 0;
    const left = node.paddingLeft || 0;
    css += `  padding: ${top}px ${right}px ${bottom}px ${left}px;\n`;
  }

  // Typography
  if (node.style) {
    if (node.style.fontFamily) {
      css += `  font-family: '${node.style.fontFamily}';\n`;
    }
    if (node.style.fontSize) {
      css += `  font-size: ${node.style.fontSize}px;\n`;
    }
    if (node.style.fontWeight) {
      css += `  font-weight: ${node.style.fontWeight};\n`;
    }
    if (node.style.lineHeightPx) {
      css += `  line-height: ${node.style.lineHeightPx}px;\n`;
    }
  }

  // Effects
  if (node.effects) {
    const shadows: string[] = [];
    node.effects.forEach((effect: any) => {
      if (effect.type === 'DROP_SHADOW') {
        const { r, g, b, a = 1 } = effect.color || { r: 0, g: 0, b: 0, a: 1 };
        const color = `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a})`;
        shadows.push(`${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${color}`);
      }
    });
    if (shadows.length > 0) {
      css += `  box-shadow: ${shadows.join(', ')};\n`;
    }
  }

  css += '}\n';
  return css;
};
