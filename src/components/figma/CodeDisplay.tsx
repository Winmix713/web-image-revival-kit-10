import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Copy, Download, Check, FileText, Database, Palette, Settings } from 'lucide-react';
import { GeneratedJavaScript } from '../../types/figma';

interface CodeDisplayProps {
  generatedCode: GeneratedJavaScript;
  figmaData?: any;
}

export function CodeDisplay({ generatedCode, figmaData }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode.code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedCode.metadata.fileName.replace(/[^a-zA-Z0-9]/g, '-')}.js`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMetadataFromCode = () => {
    if (!figmaData) return null;

    return {
      nodeCount: countNodes(figmaData.document),
      componentCount: Object.keys(figmaData.components || {}).length,
      styleCount: Object.keys(figmaData.styles || {}).length,
      colorCount: extractColors(figmaData.document).length,
    };
  };

  const countNodes = (node: any): number => {
    let count = 1;
    if (node.children && Array.isArray(node.children)) {
      count += node.children.reduce((sum: number, child: any) => sum + countNodes(child), 0);
    }
    return count;
  };

  const extractColors = (node: any): string[] => {
    const colors = new Set<string>();
    
    const traverse = (currentNode: any) => {
      if (currentNode.computedStyles?.fills) {
        currentNode.computedStyles.fills.forEach((fill: any) => {
          if (fill.computedColor && fill.computedColor !== 'transparent') {
            colors.add(fill.computedColor);
          }
        });
      }
      
      if (currentNode.children && Array.isArray(currentNode.children)) {
        currentNode.children.forEach(traverse);
      }
    };
    
    traverse(node);
    return Array.from(colors);
  };

  const metadata = getMetadataFromCode();

  return (
    <div className="w-full space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated JavaScript Code
              </CardTitle>
              <CardDescription>
                Complete Figma component representation • Generated {new Date(generatedCode.metadata.generatedAt).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download .js
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {formatFileSize(generatedCode.metadata.size)}
            </Badge>
            <Badge variant="outline">
              {generatedCode.code.split('\n').length} lines
            </Badge>
            {generatedCode.metadata.nodeId && (
              <Badge variant="outline">
                Node: {generatedCode.metadata.nodeId}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed content */}
      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="code" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Styles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <pre className="bg-gray-50 p-6 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                  <code>{generatedCode.code}</code>
                </pre>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/80">
                    JavaScript
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>File Metadata</CardTitle>
              <CardDescription>
                Information about the Figma file and generated code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">File Name</Label>
                  <p className="text-sm">{generatedCode.metadata.fileName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">File Key</Label>
                  <p className="text-sm font-mono">{generatedCode.metadata.fileKey}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Generated At</Label>
                  <p className="text-sm">{new Date(generatedCode.metadata.generatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Code Size</Label>
                  <p className="text-sm">{formatFileSize(generatedCode.metadata.size)}</p>
                </div>
                {metadata && (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Total Nodes</Label>
                      <p className="text-sm">{metadata.nodeCount}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Components</Label>
                      <p className="text-sm">{metadata.componentCount}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Styles</Label>
                      <p className="text-sm">{metadata.styleCount}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Colors</Label>
                      <p className="text-sm">{metadata.colorCount}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <CardDescription>
                Reusable components found in the Figma file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {figmaData?.components && Object.keys(figmaData.components).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(figmaData.components).map(([key, component]: [string, any]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{component.name || 'Unnamed Component'}</h4>
                        <Badge variant="outline">{key}</Badge>
                      </div>
                      {component.description && (
                        <p className="text-sm text-gray-600 mt-1">{component.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No components found in this file</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="styles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Styles</CardTitle>
              <CardDescription>
                Shared styles and design tokens from the Figma file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {figmaData?.styles && Object.keys(figmaData.styles).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(figmaData.styles).map(([key, style]: [string, any]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{style.name || 'Unnamed Style'}</h4>
                        <Badge variant="outline">{style.styleType || 'UNKNOWN'}</Badge>
                      </div>
                      {style.description && (
                        <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No shared styles found in this file</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for labels
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium ${className || ''}`} {...props}>
      {children}
    </label>
  );
}