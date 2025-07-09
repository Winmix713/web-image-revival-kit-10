
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { AnimatePresence } from 'framer-motion';
import { FigmaApiResponse } from '../../types/figma';
import { GenerationOptions } from './types';
import { useCodeGeneration } from './hooks/useCodeGeneration';
import { GenerationOptionsForm } from './components/GenerationOptionsForm';
import { ValidationResults } from './components/ValidationResults';
import { EnhancedCodeDisplay } from './components/EnhancedCodeDisplay';

interface CodeGeneratorCoreProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

export const CodeGeneratorCore: React.FC<CodeGeneratorCoreProps> = ({ 
  figmaData, 
  fileKey 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<GenerationOptions>({
    format: 'complete',
    includeTypes: true,
    includeComments: true,
    includeValidation: true,
    includeHelpers: true,
    includeDesignTokens: true,
    compressionLevel: 'basic',
    outputStyle: 'es6',
    treeshaking: true,
    minify: false
  });

  const {
    generatedCode,
    isGenerating,
    validationResult,
    statistics,
    extractedComponents,
    extractedStyles,
    designSystem,
    generateAdvancedCode
  } = useCodeGeneration(figmaData, fileKey);

  const handleGenerate = () => {
    generateAdvancedCode(options);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Advanced JavaScript Code Generator
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate production-ready JavaScript code from your Figma designs with advanced features 
          including TypeScript support, modular exports, design system extraction, and comprehensive validation.
        </p>
      </div>

      {/* Generation Options */}
      <GenerationOptionsForm
        options={options}
        setOptions={setOptions}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        statistics={statistics}
      />

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Generating Enhanced Code...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Advanced JavaScript Code
            </>
          )}
        </Button>
      </div>

      {/* Validation Results */}
      <AnimatePresence>
        {validationResult && (
          <ValidationResults validationResult={validationResult} />
        )}
      </AnimatePresence>

      {/* Enhanced Code Display */}
      <AnimatePresence>
        {generatedCode && (
          <EnhancedCodeDisplay
            generatedCode={generatedCode}
            options={options}
            fileName={figmaData.name}
            extractedComponents={extractedComponents}
            extractedStyles={extractedStyles}
            designSystem={designSystem || {
              colors: {},
              typography: {},
              spacing: [],
              effects: {},
              components: [],
              styles: []
            }}
            metadata={{
              fileKey,
              version: figmaData.version,
              lastModified: figmaData.lastModified,
              statistics
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodeGeneratorCore;
