
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Zap, Layers, FileText, Palette } from 'lucide-react';

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="text-center">
          <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <CardTitle className="text-lg">Complete Extraction</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Extracts all metadata, layout properties, styling information, and component hierarchy
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-center">
          <Layers className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <CardTitle className="text-lg">CSS Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Optional CSS integration from Figma's "Copy as code" for enhanced styling accuracy
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-center">
          <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <CardTitle className="text-lg">Ready-to-Use Code</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Generates clean, documented JavaScript with helper functions and usage examples
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-center">
          <Palette className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <CardTitle className="text-lg">Design Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Includes design tokens, bound variables, and shared styles for design system integration
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
