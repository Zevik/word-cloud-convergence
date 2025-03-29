
export interface Point {
  x: number; // Normalized 0-100
  y: number; // Normalized 0-100
}

export interface ProcessingResult {
  internalPoints: Point[];
  contourPoints: Point[];
  originalImageUrl: string;
  edgeImageUrl: string;
}

export interface WordElementState {
  id: string;
  word: string;
  targetX: number; // Final pixel position
  targetY: number;
  initialX: number; // Initial pixel position (outside)
  initialY: number;
  delay: number; // ms
  fontSize: number;
  finalScale: number;
  color: string; // Specific color for this word
}

export type ColorMode = 'single' | 'rainbow' | 'custom';

export type WordGardenProps = {
  internalPoints: Point[];
  words: string[];
  colorMode: ColorMode;
  color: string; // Base color hex (e.g., "#90ee90")
  customColors?: string[]; // Optional custom colors for the 'custom' mode
  animationDuration: number; // Duration in seconds from props
  isPlaying: boolean; // Trigger to start/restart animation
};

export type AnimationCanvasProps = {
  internalPoints: Point[];
  words: string[];
  colorMode: ColorMode;
  color: string;
  customColors?: string[];
  animationDuration: number;
  isPlaying: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  backgroundColor: string;
};

export type ProcessingControlsProps = {
  onProcess: () => void;
  isProcessing: boolean;
  onDurationChange: (duration: number) => void;
  animationDuration: number;
  hasImage: boolean;
  maxPoints: number;
  onMaxPointsChange: (points: number) => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  color: string;
  onColorChange: (color: string) => void;
  customColors: string[];
  onCustomColorsChange: (colors: string[]) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
};

export type PlaybackControlsProps = {
  onRestart: () => void;
  onVideoExport: () => void;
  onViewPoints: () => void;
  canPlay: boolean;
};

export type ImageUploadAreaProps = {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
};
