import React from 'react';
import CodeGeneratorCore from './CodeGeneratorCore';
import { FigmaApiResponse } from '../../types/figma';

interface JavaScriptGeneratorProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

const JavaScriptGenerator: React.FC<JavaScriptGeneratorProps> = (props) => {
  return <CodeGeneratorCore {...props} />;
};

export default JavaScriptGenerator;