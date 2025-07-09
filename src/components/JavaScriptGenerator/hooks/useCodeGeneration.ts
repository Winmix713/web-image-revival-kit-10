
import { useState, useCallback, useMemo } from 'react';
import { FigmaApiResponse } from '../../../types/figma';
import { GenerationOptions, ValidationResult, ComponentStatistics } from '../types';
import { generateCompleteCode, generateMinimalCode, generateStructuredCode, generateModularCode, generateTypeScriptCode, generateReactComponent, generateVueComponent, generateCSS, generateSCSS, generateTailwindClasses, extractDesignTokens, generateTokensCSS } from '../generators';
import { validateGeneratedCode } from '../validation';
import { EnhancedDataProcessor, ExtractedComponent, ExtractedStyle, DesignSystem } from '../utils/enhancedDataProcessor';

export const useCodeGeneration = (figmaData: FigmaApiResponse, fileKey: string) => {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [extractedComponents, setExtractedComponents] = useState<ExtractedComponent[]>([]);
  const [extractedStyles, setExtractedStyles] = useState<ExtractedStyle[]>([]);
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);

  // Process Figma data with enhanced extraction
  const processedData = useMemo(() => {
    if (!figmaData?.document) return null;
    
    try {
      const enhanced = EnhancedDataProcessor.processAdvancedFigmaData(figmaData, fileKey);
      
      // Update extracted data
      setExtractedComponents(enhanced.extractedComponents);
      setExtractedStyles(enhanced.extractedStyles);
      setDesignSystem(enhanced.designSystem);
      
      return enhanced;
    } catch (error) {
      console.error('Error processing Figma data:', error);
      return null;
    }
  }, [figmaData, fileKey]);

  // Calculate enhanced statistics
  const statistics = useMemo(() => {
    if (!processedData?.processedDocument) return null;
    
    const calculateStats = (node: any): ComponentStatistics => {
      let totalNodes = 1;
      let textNodes = node.type === 'TEXT' ? 1 : 0;
      let componentInstances = node.type === 'INSTANCE' ? 1 : 0;
      let components = node.type === 'COMPONENT' ? 1 : 0;
      let maxDepth = 0;

      if (node.children) {
        node.children.forEach((child: any) => {
          const childStats = calculateStats(child);
          totalNodes += childStats.totalNodes;
          textNodes += childStats.textNodes;
          componentInstances += childStats.componentInstances;
          components += childStats.components;
          maxDepth = Math.max(maxDepth, childStats.maxDepth + 1);
        });
      }

      const complexity = totalNodes > 50 ? 'high' : totalNodes > 20 ? 'medium' : 'low';

      return {
        totalNodes,
        textNodes,
        componentInstances,
        components,
        maxDepth,
        complexity
      };
    };

    return calculateStats(processedData.processedDocument);
  }, [processedData]);

  // Enhanced code generation function
  const generateAdvancedCode = useCallback(async (options: GenerationOptions) => {
    if (!processedData) {
      setValidationResult({
        isValid: false,
        errors: ['No processed data available'],
        warnings: [],
        suggestions: ['Please ensure Figma data is loaded correctly']
      });
      return;
    }

    setIsGenerating(true);
    setValidationResult(null);

    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      let code = '';
      switch (options.format) {
        case 'complete':
          code = generateCompleteCode(processedData, options);
          break;
        case 'minimal':
          code = generateMinimalCode(processedData, options);
          break;
        case 'structured':
          code = generateStructuredCode(processedData, options);
          break;
        case 'modular':
          code = generateModularCode(processedData, options);
          break;
        case 'typescript':
          code = generateTypeScriptCode(processedData, options);
          break;
        case 'react':
          code = generateReactComponent(processedData, options);
          break;
        case 'vue':
          code = generateVueComponent(processedData, options);
          break;
        case 'css':
          code = generateCSS(processedData, options);
          break;
        case 'scss':
          code = generateSCSS(processedData, options);
          break;
        case 'tailwind':
          code = generateTailwindClasses(processedData, options);
          break;
      }

      // Add design tokens if requested
      if (options.includeDesignTokens && designSystem) {
        const tokensCSS = generateTokensCSS(designSystem);
        code += `\n\n/* Design System CSS Variables */\n${tokensCSS}`;
      }

      // Post-process code
      if (options.minify) {
        code = code
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\/\/.*$/gm, '') // Remove single line comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .trim();
      }

      setGeneratedCode(code);
      
      // Enhanced validation
      const validation = await validateGeneratedCode(code, {
        components: extractedComponents,
        styles: extractedStyles,
        designSystem: designSystem || undefined
      });
      
      setValidationResult(validation);

    } catch (error) {
      console.error('Code generation failed:', error);
      setValidationResult({
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        suggestions: ['Try a different format', 'Check your Figma data structure']
      });
    } finally {
      setIsGenerating(false);
    }
  }, [processedData, extractedComponents, extractedStyles, designSystem]);

  return {
    generatedCode,
    isGenerating,
    validationResult,
    processedData,
    statistics,
    extractedComponents,
    extractedStyles,
    designSystem,
    generateAdvancedCode
  };
};
