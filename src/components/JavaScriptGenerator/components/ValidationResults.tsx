
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { motion } from 'framer-motion';
import { ValidationResult } from '../types';

interface ValidationResultsProps {
  validationResult: ValidationResult;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({ validationResult }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`border-l-4 ${
        validationResult.isValid 
          ? 'border-l-green-500 bg-green-50' 
          : 'border-l-red-500 bg-red-50'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {validationResult.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>Validation Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {validationResult.errors.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 mb-2">Errors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">Warnings:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-orange-600">{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Suggestions:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-600">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
