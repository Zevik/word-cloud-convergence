
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

export type WordGardenProps = {
  internalPoints: Point[];
  words: string[];
  color: string; // Base color hex (e.g., "#90ee90")
  animationDuration: number; // Duration in seconds from props
  isPlaying: boolean; // Trigger to start/restart animation
};

export type AnimationCanvasProps = {
  internalPoints: Point[];
  words: string[];
  color: string;
  animationDuration: number;
  isPlaying: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
};

export type ProcessingControlsProps = {
  onProcess: () => void;
  isProcessing: boolean;
  onDurationChange: (duration: number) => void;
  animationDuration: number;
  hasImage: boolean;
};

export type PlaybackControlsProps = {
  onRestart: () => void;
  onExport: () => void;
  onViewPoints: () => void;
  canPlay: boolean;
};

export type ImageUploadAreaProps = {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
};
