
import { FigmaApiResponse } from '../../types/figma';
import { ProcessingError } from '../types';
import { validateNode } from './nodeValidation';

export const validateFigmaData = (data: FigmaApiResponse): ProcessingError[] => {
  const errors: ProcessingError[] = [];

  if (!data) {
    errors.push({ type: 'VALIDATION', message: 'Figma data is null or undefined' });
    return errors;
  }

  if (!data.document) {
    errors.push({ type: 'VALIDATION', message: 'Missing document in Figma data' });
  }

  if (!data.name) {
    errors.push({ type: 'VALIDATION', message: 'Missing file name' });
  }

  // Validate document structure
  if (data.document) {
    const traverse = (node: any, path: string = 'document') => {
      const nodeErrors = validateNode(node);
      nodeErrors.forEach(error => {
        errors.push({
          ...error,
          message: `${path}: ${error.message}`
        });
      });

      if (node.children) {
        node.children.forEach((child: any, index: number) => {
          traverse(child, `${path}.children[${index}]`);
        });
      }
    };

    traverse(data.document);
  }

  return errors;
};
