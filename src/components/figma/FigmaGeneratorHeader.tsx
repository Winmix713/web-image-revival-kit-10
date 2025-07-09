
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeft, Code2 } from 'lucide-react';

export function FigmaGeneratorHeader() {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Code2 className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Enhanced Figma to JavaScript Generator
        </h1>
      </div>
      
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Convert your Figma designs into comprehensive JavaScript code with optional CSS integration 
        for enhanced accuracy and styling information.
      </p>
    </div>
  );
}
