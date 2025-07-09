
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Palette, Type, Sparkles, Eye } from 'lucide-react';
import { ExtractedStyle, DesignSystem } from '../utils/enhancedDataProcessor';

interface StylesTabProps {
  styles: ExtractedStyle[];
  designSystem: DesignSystem;
}

export const StylesTab: React.FC<StylesTabProps> = ({ styles, designSystem }) => {
  const colorStyles = styles.filter(s => s.type === 'FILL');
  const textStyles = styles.filter(s => s.type === 'TEXT');
  const effectStyles = styles.filter(s => s.type === 'EFFECT');

  if (!styles || styles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Palette className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Shared Styles Found</h3>
        <p className="text-gray-500 max-w-md">
          This Figma file doesn't contain any shared styles. Shared styles help maintain 
          consistency across your design system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Design System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Design System Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Object.keys(designSystem.colors).length}</div>
              <div className="text-sm text-gray-500">Colors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Object.keys(designSystem.typography).length}</div>
              <div className="text-sm text-gray-500">Typography</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{designSystem.spacing.length}</div>
              <div className="text-sm text-gray-500">Spacing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(designSystem.effects).length}</div>
              <div className="text-sm text-gray-500">Effects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Styles */}
      {colorStyles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-blue-600" />
            Color Styles ({colorStyles.length})
          </h3>
          <div className="grid gap-3">
            {colorStyles.map((style) => (
              <Card key={style.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm flex-shrink-0"
                      style={{ backgroundColor: style.cssValue }}
                      title={style.cssValue}
                    />
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{style.name}</h4>
                      <p className="text-sm text-gray-500 font-mono">{style.cssValue}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {style.usage.length} uses
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Typography Styles */}
      {textStyles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Type className="w-5 h-5 mr-2 text-green-600" />
            Text Styles ({textStyles.length})
          </h3>
          <div className="grid gap-3">
            {textStyles.map((style) => (
              <Card key={style.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900 mb-1">{style.name}</h4>
                      <div className="text-sm text-gray-500 space-y-1">
                        {style.value?.fontFamily && (
                          <div>Font: {style.value.fontFamily}</div>
                        )}
                        {style.value?.fontSize && (
                          <div>Size: {style.value.fontSize}px</div>
                        )}
                        {style.value?.fontWeight && (
                          <div>Weight: {style.value.fontWeight}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {style.usage.length} uses
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Effect Styles */}
      {effectStyles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-purple-600" />
            Effect Styles ({effectStyles.length})
          </h3>
          <div className="grid gap-3">
            {effectStyles.map((style) => (
              <Card key={style.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900 mb-1">{style.name}</h4>
                      <p className="text-sm text-gray-500 font-mono">{style.cssValue}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {style.usage.length} uses
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Design Tokens */}
      {designSystem.spacing.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spacing Scale</h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {designSystem.spacing.map((value, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="bg-blue-200 h-4 rounded"
                      style={{ width: Math.min(value, 100) }}
                    />
                    <span className="text-sm text-gray-600">{value}px</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
