import React from 'react';
import { Code, FileText, Palette, Layers } from 'lucide-react';
import { GenerationOptions } from '../types';

interface FormatPreviewProps {
  format: GenerationOptions['format'];
  className?: string;
}

export const FormatPreview: React.FC<FormatPreviewProps> = ({ format, className = '' }) => {
  const getFormatInfo = () => {
    switch (format) {
      case 'react':
        return {
          icon: <Code className="w-5 h-5 text-blue-500" />,
          title: 'React Component',
          description: 'Generates a fully functional React component with TypeScript interfaces and proper JSX structure.',
          features: ['JSX Structure', 'TypeScript Props', 'CSS-in-JS Ready', 'Component Logic'],
          extension: '.tsx',
          color: 'blue'
        };
        
      case 'vue':
        return {
          icon: <Layers className="w-5 h-5 text-green-500" />,
          title: 'Vue Single File Component',
          description: 'Creates a complete Vue SFC with template, script, and scoped style sections.',
          features: ['Template Section', 'Composition API', 'Scoped Styles', 'TypeScript Support'],
          extension: '.vue',
          color: 'green'
        };
        
      case 'css':
        return {
          icon: <Palette className="w-5 h-5 text-purple-500" />,
          title: 'CSS Stylesheet',
          description: 'Pure CSS with semantic class names, responsive design, and modern CSS features.',
          features: ['Semantic Classes', 'Flexbox Layout', 'CSS Grid', 'Modern Properties'],
          extension: '.css',
          color: 'purple'
        };
        
      case 'scss':
        return {
          icon: <Palette className="w-5 h-5 text-pink-500" />,
          title: 'SCSS with Mixins',
          description: 'Advanced SCSS with variables, mixins, and nested selectors for maintainable styles.',
          features: ['SCSS Variables', 'Mixins & Functions', 'Nesting', 'Responsive Helpers'],
          extension: '.scss',
          color: 'pink'
        };
        
      case 'tailwind':
        return {
          icon: <Code className="w-5 h-5 text-cyan-500" />,
          title: 'Tailwind CSS Classes',
          description: 'Utility-first CSS with Tailwind classes and custom configuration suggestions.',
          features: ['Utility Classes', 'Responsive Design', 'Custom Config', 'HTML Structure'],
          extension: '.html',
          color: 'cyan'
        };
        
      case 'typescript':
        return {
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          title: 'TypeScript Definitions',
          description: 'Complete TypeScript interfaces and type definitions for full type safety.',
          features: ['Type Definitions', 'Interface Generation', 'Enum Types', 'Utility Types'],
          extension: '.ts',
          color: 'blue'
        };
        
      default:
        return {
          icon: <FileText className="w-5 h-5 text-gray-500" />,
          title: 'JavaScript Export',
          description: 'Standard JavaScript export with complete Figma data structure.',
          features: ['Full Data Export', 'Helper Functions', 'Documentation', 'Examples'],
          extension: '.js',
          color: 'gray'
        };
    }
  };

  const info = getFormatInfo();

  return (
    <div className={`p-4 border rounded-lg bg-white ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {info.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900">{info.title}</h3>
            <span className={`text-xs px-2 py-1 rounded bg-${info.color}-100 text-${info.color}-700`}>
              {info.extension}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-3">{info.description}</p>
          <div className="flex flex-wrap gap-1">
            {info.features.map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};