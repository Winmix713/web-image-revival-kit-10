export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url?: string;
  last_modified: string;
  version: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: Fill[];
  strokes?: Stroke[];
  effects?: Effect[];
  cornerRadius?: number;
  layoutMode?: string;
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  characters?: string;
  style?: TextStyle;
  absoluteBoundingBox?: Rectangle;
  constraints?: Constraints;
  componentPropertyDefinitions?: Record<string, ComponentProperty>;
  boundVariables?: Record<string, BoundVariable>;
  styleReferences?: Record<string, string>;
}

export interface Fill {
  type: string;
  color?: Color;
  opacity?: number;
  gradientStops?: GradientStop[];
  gradientTransform?: number[][];
}

export interface Stroke {
  type: string;
  color?: Color;
  strokeWeight?: number;
  strokeAlign?: string;
  strokeCap?: string;
  strokeJoin?: string;
}

export interface Effect {
  type: string;
  color?: Color;
  offset?: Vector;
  radius?: number;
  spread?: number;
  visible?: boolean;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface GradientStop {
  color: Color;
  position: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeightPx?: number;
  letterSpacing?: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
}

export interface Constraints {
  vertical: string;
  horizontal: string;
}

export interface ComponentProperty {
  type: string;
  defaultValue?: any;
  variantOptions?: string[];
}

export interface BoundVariable {
  type: string;
  id: string;
}

export interface FigmaApiResponse {
  document: FigmaNode;
  components: Record<string, any>;
  styles: Record<string, any>;
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
  version: string;
  role: string;
  editorType: string;
}

export interface GeneratedJavaScript {
  code: string;
  metadata: {
    fileKey: string;
    fileName: string;
    nodeId?: string;
    generatedAt: string;
    size: number;
  };
}