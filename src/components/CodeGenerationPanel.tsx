import React from 'react';
import { Code2, Download, Copy, FileText, Zap, Subscript as Javascript } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import JavaScriptGenerator from './JavaScriptGenerator/index';
import { FigmaApiResponse } from '../types/figma';

interface CodeGenerationPanelProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

export const CodeGenerationPanel: React.FC<CodeGenerationPanelProps> = ({ 
  figmaData, 
  fileKey 
}) => {
  return (
    <Tabs defaultValue="javascript" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="javascript" className="flex items-center space-x-2">
          <Javascript className="w-4 h-4" />
          <span>JavaScript</span>
        </TabsTrigger>
        <TabsTrigger value="react" className="flex items-center space-x-2">
          <Code2 className="w-4 h-4" />
          <span>React</span>
        </TabsTrigger>
        <TabsTrigger value="css" className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>CSS</span>
        </TabsTrigger>
        <TabsTrigger value="vue" className="flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>Vue</span>
        </TabsTrigger>
        <TabsTrigger value="html" className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>HTML</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="javascript">
        <JavaScriptGenerator figmaData={figmaData} fileKey={fileKey} />
      </TabsContent>

      <TabsContent value="react">
        <div className="space-y-6">
          <div className="text-center py-12">
            <Code2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">React Components</h3>
            <p className="text-gray-600 mb-6">
              Generate React/TypeScript components from your Figma designs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Code2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">React Components</h4>
                    <p className="text-sm text-gray-500">Generate React/TypeScript components</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Tailwind CSS</Badge>
                  <Badge variant="outline">Responsive</Badge>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Generate React Code
                </Button>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Coming Soon:</strong> React component generation is currently in development.
              </p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="css">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CSS Generation</h3>
          <p className="text-gray-600">Extract CSS/SCSS styles from your Figma components.</p>
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Coming Soon:</strong> CSS generation features are currently in development.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="vue">
        <div className="text-center py-12">
          <Zap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Vue Components</h3>
          <p className="text-gray-600">Generate Vue.js components from your Figma designs.</p>
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Coming Soon:</strong> Vue component generation is currently in development.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="html">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">HTML/CSS Export</h3>
          <p className="text-gray-600">Generate static HTML with CSS from your Figma designs.</p>
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Coming Soon:</strong> HTML/CSS generation is currently in development.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CodeGenerationPanel;