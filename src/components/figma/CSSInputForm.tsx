
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle, Code, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface CSSInputFormProps {
  onCSSSubmit: (cssData: string) => void;
  isProcessing?: boolean;
}

export function CSSInputForm({ onCSSSubmit, isProcessing = false }: CSSInputFormProps) {
  const [cssData, setCSSData] = useState('');
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'pending'>('pending');
  const [validationMessage, setValidationMessage] = useState('');

  const validateCSS = (css: string) => {
    if (!css.trim()) {
      setValidationStatus('pending');
      setValidationMessage('');
      return;
    }

    try {
      // More flexible CSS validation
      const trimmedCSS = css.trim();
      
      // Check for basic CSS structure - look for either selectors or CSS properties
      const hasSelectors = /[.#]?[\w-]+\s*\{[^}]*\}/g.test(trimmedCSS);
      const hasProperties = /[\w-]+\s*:\s*[^;]+;?/g.test(trimmedCSS);
      const hasValidBraces = (trimmedCSS.match(/\{/g) || []).length === (trimmedCSS.match(/\}/g) || []).length;
      
      // Check for common CSS patterns
      const cssPatterns = [
        /[\w-]+\s*:\s*[^;]+;/, // property: value;
        /\.[a-zA-Z][\w-]*\s*\{/, // class selector
        /#[a-zA-Z][\w-]*\s*\{/, // id selector
        /[a-zA-Z][\w-]*\s*\{/, // element selector
        /@[\w-]+/, // at-rules like @media
      ];
      
      const hasValidPatterns = cssPatterns.some(pattern => pattern.test(trimmedCSS));
      
      // More lenient validation - accept if it has properties OR selectors OR valid patterns
      if (!hasValidBraces) {
        setValidationStatus('invalid');
        setValidationMessage('Mismatched curly braces in CSS. Please check your CSS syntax.');
        return;
      }
      
      if (!hasSelectors && !hasProperties && !hasValidPatterns) {
        setValidationStatus('invalid');
        setValidationMessage('No valid CSS content detected. Please paste CSS code with selectors and properties.');
        return;
      }

      // Check for Figma-specific patterns
      const figmaPatterns = [
        /figma/i,
        /layer/i,
        /component/i,
        /frame/i,
        /group/i,
        /auto-layout/i,
        /\.[\w-]*\d+/, // classes with numbers (common in Figma exports)
      ];
      
      const isFigmaCSS = figmaPatterns.some(pattern => pattern.test(trimmedCSS));
      
      if (isFigmaCSS) {
        setValidationStatus('valid');
        setValidationMessage('✅ Valid Figma CSS detected! This will enhance your JavaScript generation with accurate styling information.');
      } else if (hasSelectors || hasProperties) {
        setValidationStatus('valid');
        setValidationMessage('✅ Valid CSS detected. While this appears to be generic CSS rather than Figma-generated CSS, it will still be processed.');
      } else {
        setValidationStatus('valid');
        setValidationMessage('✅ CSS content detected and ready for processing.');
      }
      
    } catch (error) {
      setValidationStatus('invalid');
      setValidationMessage('Error parsing CSS content. Please check the format and try again.');
    }
  };

  const handleCSSChange = (value: string) => {
    setCSSData(value);
    validateCSS(value);
  };

  const handleSubmit = () => {
    if (cssData.trim()) {
      // Always submit if there's content, let the backend parser handle detailed validation
      onCSSSubmit(cssData);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Import Figma CSS
        </CardTitle>
        <CardDescription>
          Paste the CSS code from Figma's "Copy as code → CSS (all layers)" feature to enhance your JavaScript generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="css-input">CSS Code</Label>
          <Textarea
            id="css-input"
            placeholder="Paste your CSS code here...

Examples of accepted formats:
• Figma exported CSS
• Standard CSS with selectors
• CSS properties and values
• Media queries and animations"
            value={cssData}
            onChange={(e) => handleCSSChange(e.target.value)}
            className="min-h-32 font-mono text-sm"
            disabled={isProcessing}
          />
        </div>

        {/* Real-time validation feedback */}
        {validationStatus !== 'pending' && (
          <Alert variant={validationStatus === 'valid' ? 'default' : 'destructive'}>
            {validationStatus === 'valid' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{validationMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {cssData.length > 0 && (
              <span>{cssData.length} characters • {cssData.split('\n').length} lines</span>
            )}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!cssData.trim() || isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Use CSS Data
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How to get CSS from Figma:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Select your component or frame in Figma</li>
            <li>Right-click and choose "Copy as code"</li>
            <li>Select "CSS (all layers)" from the options</li>
            <li>Paste the generated CSS code above</li>
          </ol>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> You can also paste any valid CSS code. The tool accepts various CSS formats including custom styles, media queries, and design system tokens.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
