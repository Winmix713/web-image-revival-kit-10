
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  Code, 
  Download, 
  Copy, 
  FileText, 
  Component, 
  Palette,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ComponentsTab } from './ComponentsTab';
import { StylesTab } from './StylesTab';
import { GenerationOptions } from '../types';
import { ExtractedComponent, ExtractedStyle, DesignSystem } from '../utils/enhancedDataProcessor';

interface EnhancedCodeDisplayProps {
  generatedCode: string;
  options: GenerationOptions;
  fileName: string;
  extractedComponents: ExtractedComponent[];
  extractedStyles: ExtractedStyle[];
  designSystem: DesignSystem;
  metadata?: any;
}

export const EnhancedCodeDisplay: React.FC<EnhancedCodeDisplayProps> = ({
  generatedCode,
  options,
  fileName,
  extractedComponents,
  extractedStyles,
  designSystem,
  metadata
}) => {
  const [activeTab, setActiveTab] = useState('code');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => ({
    linesOfCode: generatedCode.split('\n').length,
    fileSize: new Blob([generatedCode]).size,
    components: extractedComponents.length,
    styles: extractedStyles.length,
    complexity: extractedComponents.length > 10 ? 'high' : extractedComponents.length > 5 ? 'medium' : 'low'
  }), [generatedCode, extractedComponents, extractedStyles]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const extension = options.format === 'typescript' ? 'ts' : 
                     options.format === 'react' ? 'tsx' :
                     options.format === 'vue' ? 'vue' :
                     options.format === 'css' ? 'css' :
                     options.format === 'scss' ? 'scss' : 'js';
    
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\s+/g, '-').toLowerCase()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-blue-600" />
              <span>Generated Code</span>
              <Badge variant="secondary" className="ml-2">
                {options.format.toUpperCase()}
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.linesOfCode}</div>
              <div className="text-sm text-gray-500">Lines</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {(stats.fileSize / 1024).toFixed(1)}KB
              </div>
              <div className="text-sm text-gray-500">Size</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.components}</div>
              <div className="text-sm text-gray-500">Components</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.styles}</div>
              <div className="text-sm text-gray-500">Styles</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                stats.complexity === 'high' ? 'text-red-600' :
                stats.complexity === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {stats.complexity === 'high' ? (
                  <AlertCircle className="w-8 h-8 mx-auto" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                )}
              </div>
              <div className="text-sm text-gray-500 capitalize">{stats.complexity}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="code" className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Code</span>
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center space-x-2">
            <Component className="w-4 h-4" />
            <span className="hidden sm:inline">Components</span>
            {extractedComponents.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {extractedComponents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Styles</span>
            {extractedStyles.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {extractedStyles.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Metadata</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <pre className="bg-gray-50 p-6 rounded-lg overflow-x-auto text-sm">
                <code className="language-javascript">{generatedCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          <ComponentsTab components={extractedComponents} />
        </TabsContent>

        <TabsContent value="styles" className="mt-6">
          <StylesTab styles={extractedStyles} designSystem={designSystem} />
        </TabsContent>

        <TabsContent value="metadata" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-gray-600" />
                <span>File Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">File Name</label>
                    <div className="mt-1 text-sm text-gray-900">{fileName}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Format</label>
                    <div className="mt-1">
                      <Badge variant="outline">{options.format.toUpperCase()}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Generated</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Options</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {options.includeTypes && <Badge variant="secondary" className="text-xs">Types</Badge>}
                      {options.includeComments && <Badge variant="secondary" className="text-xs">Comments</Badge>}
                      {options.includeHelpers && <Badge variant="secondary" className="text-xs">Helpers</Badge>}
                      {options.includeDesignTokens && <Badge variant="secondary" className="text-xs">Tokens</Badge>}
                    </div>
                  </div>
                </div>
                
                {metadata && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Raw Metadata</label>
                    <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
