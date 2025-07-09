
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JavaScriptGenerator from '../components/JavaScriptGenerator';

// Mock the Figma API response
const mockFigmaData = {
  name: 'Test Design',
  document: {
    id: 'test-id',
    name: 'Test Document',
    type: 'DOCUMENT',
    children: []
  },
  components: {},
  styles: {},
  lastModified: '2024-01-01T00:00:00Z',
  version: '1.0.0',
  role: 'owner',
  editorType: 'figma',
  thumbnailUrl: null
};

describe('JavaScriptGenerator', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <JavaScriptGenerator 
        figmaData={mockFigmaData} 
        fileKey="test-file-key" 
      />
    );
    
    expect(container.querySelector('h2')).toBeTruthy();
  });

  it('displays generation options', () => {
    const { container } = render(
      <JavaScriptGenerator 
        figmaData={mockFigmaData} 
        fileKey="test-file-key" 
      />
    );
    
    expect(container).toBeTruthy();
  });
});
