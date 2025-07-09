import React from 'react';
import { Package, Palette, Type, Grid, Layers, Component } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface DesignSystemPanelProps {
  figmaData?: any;
}

export const DesignSystemPanel: React.FC<DesignSystemPanelProps> = ({ figmaData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Design System Panel</h3>
        <p className="text-gray-600 mb-6">
          Analyze and extract design tokens, components, and patterns from your Figma file.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Palette className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Color Tokens</h4>
                <p className="text-sm text-gray-500">Extract color palette</p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Type className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Typography</h4>
                <p className="text-sm text-gray-500">Font styles & scales</p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Grid className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Spacing</h4>
                <p className="text-sm text-gray-500">Layout & spacing tokens</p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Component className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">Components</h4>
                <p className="text-sm text-gray-500">Reusable components</p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Layers className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">Effects</h4>
                <p className="text-sm text-gray-500">Shadows & effects</p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Grid className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-medium">Grid System</h4>
                <p className="text-sm text-gray-500">Layout grids</p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemPanel;