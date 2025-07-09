
import { FigmaApiResponse, GeneratedJavaScript } from '../types/figma';
import { extractMetadata } from './figma/metadata';
import { processNodeStructure } from './figma/nodeProcessor';
import { extractDesignTokens } from './figma/designTokens';
import { generateJavaScriptCode } from './figma/codeGenerator';

export class FigmaToJSGenerator {
  generateFromFigmaData(
    figmaData: FigmaApiResponse,
    fileKey: string,
    nodeId?: string
  ): GeneratedJavaScript {
    const processedData = processNodeStructure(figmaData.document);
    const metadata = extractMetadata(figmaData, fileKey, nodeId);
    const designTokens = extractDesignTokens(figmaData);
    
    const code = generateJavaScriptCode({
      metadata,
      document: processedData,
      components: figmaData.components,
      styles: figmaData.styles,
      designTokens,
    });

    return {
      code,
      metadata: {
        fileKey,
        fileName: figmaData.name,
        nodeId,
        generatedAt: new Date().toISOString(),
        size: code.length,
      },
    };
  }
}

export const codeGenerator = new FigmaToJSGenerator();
