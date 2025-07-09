
import { ProcessingError } from '../types';

export const validateNode = (node: any): ProcessingError[] => {
  const errors: ProcessingError[] = [];

  if (!node) {
    errors.push({ type: 'VALIDATION', message: 'Node is null or undefined' });
    return errors;
  }

  if (!node.id) {
    errors.push({ type: 'VALIDATION', message: 'Missing node ID' });
  }

  if (!node.type) {
    errors.push({ type: 'VALIDATION', message: 'Missing node type' });
  }

  if (node.type === 'TEXT' && !node.characters) {
    errors.push({ 
      type: 'VALIDATION', 
      message: 'Text node missing characters',
      nodeId: node.id 
    });
  }

  if (node.type === 'COMPONENT' && !node.name) {
    errors.push({
      type: 'VALIDATION',
      message: 'Component missing name',
      nodeId: node.id
    });
  }

  return errors;
};
