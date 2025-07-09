
import { FigmaApiResponse } from '../../types/figma';

export const extractMetadata = (figmaData: FigmaApiResponse, fileKey: string, nodeId?: string) => {
  const sourceURL = nodeId 
    ? `https://www.figma.com/file/${fileKey}?node-id=${nodeId.replace(':', '-')}`
    : `https://www.figma.com/file/${fileKey}`;

  return {
    fileKey,
    fileName: figmaData.name,
    lastModified: figmaData.lastModified,
    thumbnailUrl: figmaData.thumbnailUrl,
    nodeID: figmaData.document.id,
    name: figmaData.document.name,
    type: figmaData.document.type,
    sourceURL,
    version: figmaData.version,
    role: figmaData.role,
    editorType: figmaData.editorType,
  };
};
