
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { FigmaApiResponse } from '../../types/figma';
import { ParsedCSSData } from '../../services/cssParser';

interface GenerateStepProps {
  figmaData: FigmaApiResponse | null;
  cssData: ParsedCSSData | null;
  onGenerate: () => void;
  isLoading: boolean;
}

export function GenerateStep({ figmaData, cssData, onGenerate, isLoading }: GenerateStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generation Summary</CardTitle>
          <CardDescription>Review your settings before generating the JavaScript code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Figma File</h4>
              <p className="text-sm text-gray-600">{figmaData?.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">CSS Integration</h4>
              <p className="text-sm text-gray-600">
                {cssData ? `✓ ${cssData.rules.length} CSS rules parsed` : '✗ No CSS data'}
              </p>
            </div>
            {cssData && (
              <>
                <div>
                  <h4 className="font-medium text-gray-900">Design Tokens</h4>
                  <p className="text-sm text-gray-600">
                    {cssData.colors.length} colors, {cssData.fonts.length} fonts
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">CSS Features</h4>
                  <p className="text-sm text-gray-600">
                    {cssData.shadows.length} shadows, {cssData.animations.length} animations
                  </p>
                </div>
              </>
            )}
          </div>
          
          <Button onClick={onGenerate} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Generating Enhanced JavaScript...
              </>
            ) : (
              'Generate Enhanced JavaScript Code'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
