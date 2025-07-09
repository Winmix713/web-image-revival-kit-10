
import { ValidationResult } from '../types';
import { ExtractedComponent, ExtractedStyle, DesignSystem } from '../utils/enhancedDataProcessor';

interface EnhancedValidationContext {
  components?: ExtractedComponent[];
  styles?: ExtractedStyle[];
  designSystem?: DesignSystem;
}

export const validateGeneratedCode = async (
  code: string, 
  context?: EnhancedValidationContext
): Promise<ValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Basic syntax validation
  if (!code || code.trim().length === 0) {
    errors.push('Generated code is empty');
    return { isValid: false, errors, warnings, suggestions };
  }

  // Check for common syntax issues
  try {
    // Basic JavaScript syntax check (simplified)
    if (code.includes('function') || code.includes('const') || code.includes('let')) {
      // Check for unclosed brackets
      const openBrackets = (code.match(/\{/g) || []).length;
      const closeBrackets = (code.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        errors.push('Mismatched curly brackets detected');
      }

      // Check for unclosed parentheses
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push('Mismatched parentheses detected');
      }
    }
  } catch (error) {
    errors.push('Syntax validation failed');
  }

  // Enhanced validation with context
  if (context) {
    // Component validation
    if (context.components && context.components.length > 0) {
      const componentNames = context.components.map(c => c.name);
      const missingComponents = componentNames.filter(name => 
        !code.includes(name.replace(/\s+/g, ''))
      );
      
      if (missingComponents.length > 0) {
        warnings.push(`Some components may not be properly referenced: ${missingComponents.join(', ')}`);
      }

      // Check for component instances
      const hasInstances = context.components.some(c => c.instances > 0);
      if (hasInstances && !code.includes('component') && !code.includes('Component')) {
        suggestions.push('Consider generating React/Vue components for better reusability');
      }
    }

    // Style validation
    if (context.styles && context.styles.length > 0) {
      const colorStyles = context.styles.filter(s => s.type === 'FILL');
      if (colorStyles.length > 0 && !code.includes('color') && !code.includes('background')) {
        warnings.push('Color styles detected but may not be applied in generated code');
      }

      const textStyles = context.styles.filter(s => s.type === 'TEXT');
      if (textStyles.length > 0 && !code.includes('font') && !code.includes('text')) {
        warnings.push('Text styles detected but may not be applied in generated code');
      }
    }

    // Design system validation
    if (context.designSystem) {
      const { colors, typography, spacing } = context.designSystem;
      
      if (Object.keys(colors).length > 3 && !code.includes('--') && !code.includes('var(')) {
        suggestions.push('Consider using CSS custom properties for better color management');
      }

      if (Object.keys(typography).length > 2 && !code.includes('font-family')) {
        suggestions.push('Typography system detected - consider extracting font definitions');
      }

      if (spacing.length > 5 && !code.includes('padding') && !code.includes('margin')) {
        suggestions.push('Spacing system detected - consider using consistent spacing values');
      }
    }
  }

  // Code quality checks
  const codeLines = code.split('\n');
  const longLines = codeLines.filter(line => line.length > 120);
  if (longLines.length > 5) {
    warnings.push('Some code lines are very long - consider breaking them up for readability');
  }

  // Check for best practices
  if (code.includes('inline-block') || code.includes('float:')) {
    suggestions.push('Consider using modern CSS layout methods (Flexbox/Grid) instead of older techniques');
  }

  if (code.includes('!important')) {
    warnings.push('Usage of !important detected - consider improving CSS specificity instead');
  }

  // Performance suggestions
  if (code.split('\n').length > 500) {
    suggestions.push('Large code file detected - consider splitting into smaller modules');
  }

  // Accessibility checks
  if (code.includes('<div') && !code.includes('role=') && !code.includes('aria-')) {
    suggestions.push('Consider adding ARIA attributes for better accessibility');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    suggestions
  };
};
