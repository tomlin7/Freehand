export type DrawingMode = 
  | 'selection' 
  | 'rectangle' 
  | 'ellipse' 
  | 'diamond' 
  | 'arrow' 
  | 'line' 
  | 'pencil'
  | 'text'
  | 'image';

export type Element = {
  id: string;
  type: DrawingMode;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness: number;
  opacity?: number;
  fillStyle?: 'none' | 'hachure' | 'solid';
  angle?: number;
  points?: [number, number][];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  image?: string;
};