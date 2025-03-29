
import WordGarden from './WordGarden';
import { AnimationCanvasProps } from '@/types';

const AnimationCanvas: React.FC<AnimationCanvasProps> = ({
  internalPoints,
  words,
  colorMode,
  color,
  customColors,
  animationDuration,
  isPlaying,
  containerRef,
  backgroundColor,
}) => {
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg overflow-hidden relative"
      style={{ 
        minHeight: '400px',
        backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor 
      }}
    >
      {internalPoints.length > 0 ? (
        <WordGarden
          internalPoints={internalPoints}
          words={words}
          colorMode={colorMode}
          color={color}
          customColors={customColors}
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
