
import { ValidationResult } from '../types';

export const validateGeneratedCode = async (code: string): Promise<ValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Basic syntax validation
  try {
    // Check for basic JavaScript syntax issues
    if (!code.trim()) {
      errors.push('Generated code is empty');
    }

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

    // Check for required exports
    if (!code.includes('export') && !code.includes('module.exports')) {
      warnings.push('No exports found in generated code');
    }

    // Check code size
    if (code.length > 50000) {
      warnings.push('Generated code is quite large (>50KB)');
      suggestions.push('Consider using the minimal format for smaller output');
    }

    // Check for potential improvements
    if (code.includes('JSON.stringify') && code.length > 10000) {
      suggestions.push('Large JSON structures detected - consider using structured format');
    }

    if (!code.includes('function') && !code.includes('=>')) {
      suggestions.push('No helper functions detected - consider enabling helpers for better usability');
    }

  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
};
