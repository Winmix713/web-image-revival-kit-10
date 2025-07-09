
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Component, Users, Layers } from 'lucide-react';
import { ExtractedComponent } from '../utils/enhancedDataProcessor';

interface ComponentsTabProps {
  components: ExtractedComponent[];
}

export const ComponentsTab: React.FC<ComponentsTabProps> = ({ components }) => {
  if (!components || components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Component className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Components Found</h3>
        <p className="text-gray-500 max-w-md">
          This Figma file doesn't contain any defined components. Components are reusable design elements 
          that can be instantiated multiple times across your design.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Components ({components.length})
        </h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {components.reduce((sum, comp) => sum + comp.instances, 0)} total instances
        </Badge>
      </div>

      <div className="grid gap-4">
        {components.map((component) => (
          <Card key={component.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Component className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-base font-medium">
                    {component.name}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {component.instances > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {component.instances} uses
                    </Badge>
                  )}
                  {component.variants && component.variants.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Layers className="w-3 h-3 mr-1" />
                      {component.variants.length} variants
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {component.description && (
                <p className="text-sm text-gray-600 mb-3">{component.description}</p>
              )}
              
              <div className="space-y-3">
                {/* Properties */}
                {Object.keys(component.properties).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Properties</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(component.properties).map(([key, prop]: [string, any]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {prop.type?.toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants */}
                {component.variants && component.variants.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Variants</h4>
                    <div className="flex flex-wrap gap-1">
                      {component.variants.map((variant) => (
                        <Badge key={variant} variant="outline" className="text-xs">
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Children count */}
                {component.children.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Contains {component.children.length} child element{component.children.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
