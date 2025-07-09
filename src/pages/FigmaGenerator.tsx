
import React, { useState } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { AlertCircle } from 'lucide-react';
import { figmaApi } from '../services/figma-api';
import { enhancedCodeGenerator, EnhancedFigmaToJSGenerator } from '../services/enhancedCodeGenerator';
import { GeneratedJavaScript, FigmaApiResponse } from '../types/figma';
import { ParsedCSSData } from '../services/cssParser';
import { FigmaGeneratorHeader } from '../components/figma/FigmaGeneratorHeader';
import { ProgressIndicator } from '../components/figma/ProgressIndicator';
import { FeaturesGrid } from '../components/figma/FeaturesGrid';
import { InputForm } from '../components/figma/InputForm';
import { CSSStep } from '../components/figma/CSSStep';
import { GenerateStep } from '../components/figma/GenerateStep';
import { CodeDisplay } from '../components/figma/CodeDisplay';
import { InstructionsCard } from '../components/figma/InstructionsCard';

type GenerationStep = 'input' | 'css' | 'generate' | 'complete';

export default function FigmaGenerator() {
  const [currentStep, setCurrentStep] = useState<GenerationStep>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<GeneratedJavaScript | null>(null);
  const [figmaData, setFigmaData] = useState<FigmaApiResponse | null>(null);
  const [cssData, setCSSData] = useState<ParsedCSSData | null>(null);
  const [figmaParams, setFigmaParams] = useState<{fileKey: string, token: string, nodeId?: string} | null>(null);

  const handleFigmaSubmit = async (fileKey: string, token: string, nodeId?: string) => {
    setIsLoading(true);
    setError(null);
    setFigmaParams({ fileKey, token, nodeId });

    try {
      const isValidToken = await figmaApi.validateToken(token);
      if (!isValidToken) {
        throw new Error('Invalid Figma token. Please check your token and try again.');
      }

      const data = await figmaApi.fetchFigmaFile(fileKey, token, nodeId);
      setFigmaData(data);
      setCurrentStep('css');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSSSubmit = async (cssText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsedCSS = EnhancedFigmaToJSGenerator.parseCSS(cssText);
      setCSSData(parsedCSS);
      setCurrentStep('generate');
    } catch (err) {
      setError('Failed to parse CSS data. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipCSS = () => {
    setCurrentStep('generate');
  };

  const handleGenerate = async () => {
    if (!figmaData || !figmaParams) return;

    setIsLoading(true);
    setError(null);

    try {
      const generated = enhancedCodeGenerator.generateFromFigmaData({
        figmaData,
        cssData: cssData || undefined,
        fileKey: figmaParams.fileKey,
        nodeId: figmaParams.nodeId
      });
      setGeneratedCode(generated);
      setCurrentStep('complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('input');
    setGeneratedCode(null);
    setFigmaData(null);
    setCSSData(null);
    setFigmaParams(null);
    setError(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'input': return 'Figma File Details';
      case 'css': return 'CSS Integration (Optional)';
      case 'generate': return 'Ready to Generate';
      case 'complete': return 'Generated Code';
      default: return 'Generate JavaScript';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <FigmaGeneratorHeader />

        {currentStep !== 'input' && (
          <ProgressIndicator currentStep={currentStep} />
        )}

        <h2 className="text-2xl font-bold text-gray-900 text-center">{getStepTitle()}</h2>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === 'input' && (
          <>
            <FeaturesGrid />
            <InputForm onGenerate={handleFigmaSubmit} isLoading={isLoading} />
          </>
        )}

        {currentStep === 'css' && (
          <CSSStep 
            onCSSSubmit={handleCSSSubmit} 
            onSkipCSS={handleSkipCSS} 
            isLoading={isLoading} 
          />
        )}

        {currentStep === 'generate' && (
          <GenerateStep 
            figmaData={figmaData} 
            cssData={cssData} 
            onGenerate={handleGenerate} 
            isLoading={isLoading} 
          />
        )}

        {currentStep === 'complete' && generatedCode && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Generated Enhanced Code</h2>
              <Button variant="outline" onClick={handleReset}>
                Generate Another
              </Button>
            </div>
            <CodeDisplay generatedCode={generatedCode} figmaData={figmaData} />
          </div>
        )}

        {currentStep === 'input' && <InstructionsCard />}
      </div>
    </div>
  );
}
