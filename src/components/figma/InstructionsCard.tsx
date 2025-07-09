
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function InstructionsCard() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-900">How to Use</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-blue-800">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
          <div>
            <p className="font-medium">Get your Figma Personal Access Token</p>
            <p className="text-sm">Go to Figma Settings → Personal Access Tokens and create a new token</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
          <div>
            <p className="font-medium">Copy your Figma file URL</p>
            <p className="text-sm">You can paste the URL of an entire file or a specific component</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
          <div>
            <p className="font-medium">Optionally add CSS data</p>
            <p className="text-sm">Use Figma's "Copy as code → CSS" feature for enhanced styling accuracy</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
          <div>
            <p className="font-medium">Generate and download</p>
            <p className="text-sm">The tool will create enhanced JavaScript with CSS integration</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
