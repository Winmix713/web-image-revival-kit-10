import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { figmaApi } from '../../services/figma-api';

interface InputFormProps {
  onGenerate: (fileKey: string, token: string, nodeId?: string) => void;
  isLoading: boolean;
}

export function InputForm({ onGenerate, isLoading }: InputFormProps) {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [token, setToken] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!figmaUrl.trim()) {
      newErrors.figmaUrl = 'Figma URL is required';
    } else {
      const fileKey = figmaApi.extractFileKeyFromUrl(figmaUrl);
      if (!fileKey) {
        newErrors.figmaUrl = 'Invalid Figma URL format';
      }
    }

    if (!token.trim()) {
      newErrors.token = 'Figma token is required';
    } else if (token.length < 10) {
      newErrors.token = 'Token appears to be too short';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const fileKey = figmaApi.extractFileKeyFromUrl(figmaUrl);
    if (!fileKey) return;

    const extractedNodeId = nodeId.trim() || figmaApi.extractNodeIdFromUrl(figmaUrl);
    
    onGenerate(fileKey, token, extractedNodeId || undefined);
  };

  const handleUrlChange = (value: string) => {
    setFigmaUrl(value);
    
    // Auto-extract node ID from URL
    const extractedNodeId = figmaApi.extractNodeIdFromUrl(value);
    if (extractedNodeId && !nodeId) {
      setNodeId(extractedNodeId);
    }
    
    // Clear URL error when user types
    if (errors.figmaUrl) {
      setErrors(prev => ({ ...prev, figmaUrl: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate JavaScript from Figma</CardTitle>
        <CardDescription>
          Enter your Figma file details to generate a comprehensive JavaScript representation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Figma URL */}
          <div className="space-y-2">
            <Label htmlFor="figma-url">Figma URL *</Label>
            <Input
              id="figma-url"
              type="url"
              placeholder="https://www.figma.com/file/..."
              value={figmaUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={errors.figmaUrl ? 'border-red-500' : ''}
            />
            {errors.figmaUrl && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.figmaUrl}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Paste the URL of your Figma file or specific component
            </p>
          </div>

          {/* Figma Token */}
          <div className="space-y-2">
            <Label htmlFor="figma-token">Figma Personal Access Token *</Label>
            <div className="relative">
              <Input
                id="figma-token"
                type={showToken ? 'text' : 'password'}
                placeholder="Enter your Figma token"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (errors.token) {
                    setErrors(prev => ({ ...prev, token: '' }));
                  }
                }}
                className={errors.token ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.token && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.token}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Get your token from{' '}
              <a
                href="https://www.figma.com/developers/api#access-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Figma Settings → Personal Access Tokens
              </a>
            </p>
          </div>

          {/* Node ID (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="node-id">Node ID (Optional)</Label>
            <Input
              id="node-id"
              type="text"
              placeholder="1:234 (leave empty for entire file)"
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Specify a particular component or frame. If empty, the entire file will be processed.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating JavaScript...
              </>
            ) : (
              'Generate JavaScript Code'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}