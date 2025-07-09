import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Code2, 
  Settings, 
  Zap, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Loader2,
  Download,
  Copy,
  Trash2,
  RefreshCw
} from 'lucide-react';

import { useToast } from '@/components/Toast/ToastProvider';
import { useUserPreferences } from '@/store/userPreferences';
import { figmaApiService, FigmaApiOptions } from '@/services/figma/figmaApiService';
import { CSSEnhancer, EnhancementOptions } from '@/services/cssEnhancer';
import { cacheService } from '@/services/cache/cacheService';
import { FigmaApiResponse, GeneratedJavaScript } from '@/types/figma';

// Import worker
import FigmaWorker from '@/workers/figmaProcessor?worker';

type ProcessingStep = 'idle' | 'fetching' | 'processing' | 'enhancing' | 'generating' | 'complete';

interface ProcessingState {
  step: ProcessingStep;
  progress: number;
  message: string;
  startTime: number;
  endTime?: number;
}

interface GenerationOptions {
  outputFormat: 'javascript' | 'typescript' | 'json';
  includeMetadata: boolean;
  includeDesignTokens: boolean;
  includeComponents: boolean;
  includeStyles: boolean;
  generateReactComponents: boolean;
  includeCSSExport: boolean;
  enableCSSEnhancement: boolean;
  enableBackgroundProcessing: boolean;
}

export default function EnhancedFigmaGenerator() {
  const { showToast } = useToast();
  const { preferences, updatePreferences } = useUserPreferences();
  
  // State management
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaToken, setFigmaToken] = useState('');
  const [cssInput, setCSSInput] = useState('');
  const [figmaData, setFigmaData] = useState<FigmaApiResponse | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedJavaScript | null>(null);
  const [cssEnhancementResult, setCssEnhancementResult] = useState<any>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    step: 'idle',
    progress: 0,
    message: '',
    startTime: 0
  });
  const [worker, setWorker] = useState<Worker | null>(null);
  const [activeTab, setActiveTab] = useState('input');
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    outputFormat: preferences.defaultOutputFormat as 'javascript' | 'typescript' | 'json',
    includeMetadata: preferences.includeMetadata,
    includeDesignTokens: preferences.includeDesignTokens,
    includeComponents: preferences.includeComponents,
    includeStyles: preferences.includeStyles,
    generateReactComponents: preferences.generateReactComponents,
    includeCSSExport: preferences.includeCSSExport,
    enableCSSEnhancement: preferences.enableCSSEnhancement,
    enableBackgroundProcessing: preferences.enableBackgroundProcessing
  });

  // Initialize worker
  useEffect(() => {
    if (generationOptions.enableBackgroundProcessing) {
      const figmaWorker = new FigmaWorker();
      setWorker(figmaWorker);
      
      figmaWorker.onmessage = (event) => {
        const { taskId, success, result, error, progress } = event.data;
        
        if (progress !== undefined) {
          setProcessingState(prev => ({
            ...prev,
            progress,
            message: `Processing... ${progress}%`
          }));
        }
        
        if (success && result) {
          handleWorkerResult(result);
        } else if (error) {
          handleWorkerError(error);
        }
      };
      
      return () => {
        figmaWorker.terminate();
      };
    }
  }, [generationOptions.enableBackgroundProcessing]);

  // Memoized values
  const fileKey = useMemo(() => {
    return figmaApiService.extractFileKeyFromUrl(figmaUrl);
  }, [figmaUrl]);

  const nodeId = useMemo(() => {
    return figmaApiService.extractNodeIdFromUrl(figmaUrl);
  }, [figmaUrl]);

  const canGenerate = useMemo(() => {
    return fileKey && figmaToken && processingState.step === 'idle';
  }, [fileKey, figmaToken, processingState.step]);

  const canEnhanceWithCSS = useMemo(() => {
    return figmaData && cssInput.trim() && generationOptions.enableCSSEnhancement;
  }, [figmaData, cssInput, generationOptions.enableCSSEnhancement]);

  // Handler functions
  const handleWorkerResult = useCallback((result: any) => {
    setGeneratedOutput(result);
    setProcessingState(prev => ({
      ...prev,
      step: 'complete',
      progress: 100,
      message: 'Generation complete!',
      endTime: Date.now()
    }));
    
    showToast({
      type: 'success',
      title: 'Generation Complete',
      message: 'Your JavaScript code has been generated successfully!'
    });
  }, [showToast]);

  const handleWorkerError = useCallback((error: string) => {
    setProcessingState(prev => ({
      ...prev,
      step: 'idle',
      progress: 0,
      message: ''
    }));
    
    showToast({
      type: 'error',
      title: 'Generation Failed',
      message: error
    });
  }, [showToast]);

  const handleFigmaSubmit = useCallback(async () => {
    if (!fileKey || !figmaToken) return;

    setProcessingState({
      step: 'fetching',
      progress: 10,
      message: 'Fetching Figma data...',
      startTime: Date.now()
    });

    try {
      const options: FigmaApiOptions = {
        enableCaching: preferences.enableCaching,
        cacheExpiryHours: preferences.cacheExpiry,
        maxRetries: preferences.maxRetries,
        retryDelay: preferences.retryDelay,
        enableBackgroundProcessing: generationOptions.enableBackgroundProcessing
      };

      const data = await figmaApiService.fetchFigmaFile(fileKey, figmaToken, nodeId, options);
      
      setFigmaData(data);
      setProcessingState({
        step: 'processing',
        progress: 50,
        message: 'Processing Figma data...',
        startTime: Date.now()
      });

      // Move to CSS enhancement step if enabled
      if (generationOptions.enableCSSEnhancement) {
        setActiveTab('css-enhance');
        setProcessingState(prev => ({
          ...prev,
          step: 'idle',
          progress: 0,
          message: ''
        }));
      } else {
        setActiveTab('generate');
        setProcessingState(prev => ({
          ...prev,
          step: 'idle',
          progress: 0,
          message: ''
        }));
      }

      showToast({
        type: 'success',
        title: 'Figma Data Retrieved',
        message: 'Successfully fetched data from Figma API'
      });

    } catch (error) {
      setProcessingState({
        step: 'idle',
        progress: 0,
        message: '',
        startTime: 0
      });

      showToast({
        type: 'error',
        title: 'Figma Fetch Failed',
        message: error instanceof Error ? error.message : 'Failed to fetch Figma data'
      });
    }
  }, [fileKey, figmaToken, nodeId, preferences, generationOptions, showToast]);

  const handleCSSSubmit = useCallback(async () => {
    if (!canEnhanceWithCSS) return;

    setProcessingState({
      step: 'enhancing',
      progress: 20,
      message: 'Enhancing with CSS...',
      startTime: Date.now()
    });

    try {
      const enhancementOptions: EnhancementOptions = {
        strictMatching: false,
        ignoreColors: false,
        ignoreTypography: false,
        ignoreSpacing: false,
        enableAutoMapping: true,
        mappingStrategy: 'hybrid',
        minConfidence: 0.5,
        maxSuggestions: 10
      };

      const enhancementResult = CSSEnhancer.enhance(
        figmaData!,
        cssInput,
        enhancementOptions
      );

      setCssEnhancementResult(enhancementResult);
      setActiveTab('results');
      
      setProcessingState({
        step: 'idle',
        progress: 0,
        message: '',
        startTime: 0
      });

      showToast({
        type: 'success',
        title: 'CSS Enhancement Complete',
        message: `Enhanced with ${enhancementResult.mappingResults.length} CSS mappings`
      });

    } catch (error) {
      setProcessingState({
        step: 'idle',
        progress: 0,
        message: '',
        startTime: 0
      });

      showToast({
        type: 'error',
        title: 'CSS Enhancement Failed',
        message: error instanceof Error ? error.message : 'Failed to enhance with CSS'
      });
    }
  }, [canEnhanceWithCSS, figmaData, cssInput, showToast]);

  const handleGenerate = useCallback(async () => {
    if (!figmaData) return;

    setProcessingState({
      step: 'generating',
      progress: 30,
      message: 'Generating JavaScript code...',
      startTime: Date.now()
    });

    try {
      if (worker && generationOptions.enableBackgroundProcessing) {
        // Use web worker for background processing
        worker.postMessage({
          id: Date.now().toString(),
          type: 'GENERATE_CODE',
          data: {
            figmaData,
            cssData: cssEnhancementResult
          },
          options: generationOptions
        });
      } else {
        // Process in main thread
        const { enhancedCodeGenerator } = await import('@/services/enhancedCodeGenerator');
        const generated = enhancedCodeGenerator.generateFromFigmaData({
          figmaData,
          cssData: cssEnhancementResult,
          fileKey: fileKey!,
          nodeId
        });

        setGeneratedOutput(generated);
        setProcessingState({
          step: 'complete',
          progress: 100,
          message: 'Generation complete!',
          startTime: Date.now(),
          endTime: Date.now()
        });

        showToast({
          type: 'success',
          title: 'Generation Complete',
          message: 'Your JavaScript code has been generated successfully!'
        });
      }

    } catch (error) {
      setProcessingState({
        step: 'idle',
        progress: 0,
        message: '',
        startTime: 0
      });

      showToast({
        type: 'error',
        title: 'Generation Failed',
        message: error instanceof Error ? error.message : 'Failed to generate code'
      });
    }
  }, [figmaData, cssEnhancementResult, fileKey, nodeId, generationOptions, worker, showToast]);

  const handleCopyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast({
        type: 'success',
        title: 'Copied to Clipboard',
        message: 'Code has been copied to your clipboard'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy to clipboard'
      });
    }
  }, [showToast]);

  const handleDownload = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast({
      type: 'success',
      title: 'Download Started',
      message: `Downloaded ${filename}`
    });
  }, [showToast]);

  const handleReset = useCallback(() => {
    setFigmaUrl('');
    setFigmaToken('');
    setCSSInput('');
    setFigmaData(null);
    setGeneratedOutput(null);
    setCssEnhancementResult(null);
    setProcessingState({
      step: 'idle',
      progress: 0,
      message: '',
      startTime: 0
    });
    setActiveTab('input');
  }, []);

  const handleClearCache = useCallback(async () => {
    await cacheService.clear();
    showToast({
      type: 'success',
      title: 'Cache Cleared',
      message: 'All cached data has been cleared'
    });
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Enhanced Figma JS Generator
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Convert Figma designs to JavaScript with advanced CSS enhancement, 
            background processing, and intelligent caching.
          </p>
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {processingState.step !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {processingState.message}
                        </span>
                        <span className="text-sm text-gray-500">
                          {processingState.progress}%
                        </span>
                      </div>
                      <Progress value={processingState.progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="css-enhance">CSS Enhancement</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Figma Configuration</CardTitle>
                <CardDescription>
                  Enter your Figma file URL and personal access token
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Figma URL</label>
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://www.figma.com/file/..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Personal Access Token</label>
                  <input
                    type="password"
                    value={figmaToken}
                    onChange={(e) => setFigmaToken(e.target.value)}
                    placeholder="Your Figma personal access token"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button 
                  onClick={handleFigmaSubmit}
                  disabled={!canGenerate || processingState.step !== 'idle'}
                  className="w-full"
                >
                  {processingState.step === 'fetching' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Fetch Figma Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="css-enhance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CSS Enhancement</CardTitle>
                <CardDescription>
                  Enhance your Figma data with CSS for better styling accuracy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CSS Code</label>
                  <textarea
                    value={cssInput}
                    onChange={(e) => setCSSInput(e.target.value)}
                    placeholder="Paste your CSS code here..."
                    className="w-full h-64 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCSSSubmit}
                    disabled={!canEnhanceWithCSS || processingState.step !== 'idle'}
                    className="flex-1"
                  >
                    {processingState.step === 'enhancing' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Enhance with CSS
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('generate')}
                  >
                    Skip CSS Enhancement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generation Options</CardTitle>
                <CardDescription>
                  Configure how your JavaScript code should be generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output Format</label>
                    <select
                      value={generationOptions.outputFormat}
                      onChange={(e) => setGenerationOptions(prev => ({
                        ...prev,
                        outputFormat: e.target.value as 'javascript' | 'typescript' | 'json'
                      }))}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Options</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={generationOptions.includeMetadata}
                          onChange={(e) => setGenerationOptions(prev => ({
                            ...prev,
                            includeMetadata: e.target.checked
                          }))}
                        />
                        <span className="text-sm">Include Metadata</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={generationOptions.includeDesignTokens}
                          onChange={(e) => setGenerationOptions(prev => ({
                            ...prev,
                            includeDesignTokens: e.target.checked
                          }))}
                        />
                        <span className="text-sm">Include Design Tokens</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={generationOptions.includeComponents}
                          onChange={(e) => setGenerationOptions(prev => ({
                            ...prev,
                            includeComponents: e.target.checked
                          }))}
                        />
                        <span className="text-sm">Include Components</span>
                      </label>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={!figmaData || processingState.step !== 'idle'}
                  className="w-full"
                >
                  {processingState.step === 'generating' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Code2 className="w-4 h-4 mr-2" />
                      Generate JavaScript
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {generatedOutput && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Generated Code</CardTitle>
                      <CardDescription>
                        Your JavaScript code is ready for use
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToClipboard(generatedOutput.code)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(generatedOutput.code, 'figma-code.js')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                    <code>{generatedOutput.code}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {cssEnhancementResult && (
              <Card>
                <CardHeader>
                  <CardTitle>CSS Enhancement Results</CardTitle>
                  <CardDescription>
                    CSS mapping and enhancement statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {cssEnhancementResult.mappingResults.length}
                      </div>
                      <div className="text-sm text-gray-600">CSS Mappings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(cssEnhancementResult.coverage * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Coverage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {cssEnhancementResult.conflicts.length}
                      </div>
                      <div className="text-sm text-gray-600">Conflicts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" onClick={handleClearCache}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab('input')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}