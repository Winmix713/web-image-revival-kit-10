
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CSSInputForm } from './CSSInputForm';

interface CSSStepProps {
  onCSSSubmit: (cssText: string) => void;
  onSkipCSS: () => void;
  isLoading: boolean;
}

export function CSSStep({ onCSSSubmit, onSkipCSS, isLoading }: CSSStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Enhance your JavaScript generation with CSS data from Figma for more accurate styling information.
        </p>
      </div>
      
      <Tabs defaultValue="css-input" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="css-input">Add CSS Data</TabsTrigger>
          <TabsTrigger value="skip">Skip CSS Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="css-input" className="mt-6">
          <CSSInputForm onCSSSubmit={onCSSSubmit} isProcessing={isLoading} />
        </TabsContent>
        
        <TabsContent value="skip" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Skip CSS Integration</CardTitle>
              <CardDescription>
                You can proceed without CSS data. Your JavaScript will still include all Figma metadata and structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onSkipCSS} className="w-full">
                Continue Without CSS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
