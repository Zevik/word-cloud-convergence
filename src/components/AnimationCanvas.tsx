
import { useRef } from 'react';
import WordGarden from './WordGarden';
import { AnimationCanvasProps } from '@/types';

const AnimationCanvas: React.FC<AnimationCanvasProps> = ({
  internalPoints,
  words,
  color,
  animationDuration,
  isPlaying,
  containerRef,
}) => {
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-background/50 rounded-lg overflow-hidden relative"
      style={{ minHeight: '400px' }}
    >
      {internalPoints.length > 0 ? (
        <WordGarden
          internalPoints={internalPoints}
          words={words}
          color={color}
          animationDuration={animationDuration}
          isPlaying={isPlaying}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            {isPlaying ? 'Processing...' : 'Upload an image and click "Create Animation" to begin'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnimationCanvas;
