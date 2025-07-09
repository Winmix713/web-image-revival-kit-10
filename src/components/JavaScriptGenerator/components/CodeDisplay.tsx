
import React, { useCallback, useState } from 'react';
import { Download, Copy, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { motion } from 'framer-motion';
import { GenerationOptions } from '../types';

interface CodeDisplayProps {
  generatedCode: string;
  options: GenerationOptions;
  fileName: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  generatedCode,
  options,
  fileName
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [generatedCode]);

  const downloadFile = useCallback(() => {
    const extension = options.format === 'typescript' ? 'ts' : 'js';
    const blob = new Blob([generatedCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `figma-${fileName.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedCode, fileName, options.format]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Generated JavaScript Code</span>
              <Badge variant="secondary">
                {options.format} • {(generatedCode.length / 1024).toFixed(1)}KB
              </Badge>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className={copySuccess ? 'bg-green-50 border-green-200' : ''}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadFile}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              value={generatedCode}
              readOnly
              className="font-mono text-xs h-96 resize-none bg-gray-50 border-gray-200"
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <Badge variant="outline" className="bg-white">
                {generatedCode.split('\n').length} lines
              </Badge>
              <Badge variant="outline" className="bg-white">
                {options.format}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              What's included in this code:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete component metadata and file information</li>
              <li>• Detailed structural hierarchy with all properties</li>
              <li>• Visual styling data (colors, effects, typography)</li>
              <li>• Layout and positioning information</li>
              <li>• Helper functions for data extraction and manipulation</li>
              <li>• Ready-to-use methods for common operations</li>
              <li>• Export format compatible with your chosen module system</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
