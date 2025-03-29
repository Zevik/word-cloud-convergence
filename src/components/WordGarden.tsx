import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WordGardenProps, WordElementState } from '@/types';

const WordGarden: React.FC<WordGardenProps> = ({
  internalPoints,
  words,
  color: baseColor,
  animationDuration,
  isPlaying,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordElements, setWordElements] = useState<WordElementState[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [startAnimation, setStartAnimation] = useState(false);

  // Convert hex to rgba
  const hexToRgba = useCallback((hex: string, alpha: number): string => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerSize({ width: clientWidth, height: clientHeight });
          console.log(`Container size: ${clientWidth}x${clientHeight}`);
        } else {
          requestAnimationFrame(updateSize);
        }
      }
    };

    updateSize();

    const handleResize = () => {
      setStartAnimation(false);
      setWordElements([]);
      requestAnimationFrame(updateSize);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Create word elements when isPlaying changes
  useEffect(() => {
    if (!isPlaying || internalPoints.length === 0 || words.length === 0 || containerSize.width === 0) {
      setWordElements([]);
      setStartAnimation(false);
      return;
    }

    console.log(`Setting up ${Math.min(internalPoints.length, 350)} words for animation...`);
    setStartAnimation(false);

    const newWordElements: WordElementState[] = [];
    const numElementsToCreate = Math.min(internalPoints.length, 350);

    for (let i = 0; i < numElementsToCreate; i++) {
      const word = words[i % words.length];
      const targetPoint = internalPoints[i];

      // Initial position outside container
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(containerSize.width, containerSize.height) * (0.6 + Math.random() * 0.3);
      const initialX = containerSize.width / 2 + Math.cos(angle) * radius;
      const initialY = containerSize.height / 2 + Math.sin(angle) * radius;

      // Final position inside container
      const jitterX = (Math.random() - 0.5) * 5;
      const jitterY = (Math.random() - 0.5) * 5;
      let targetX = (targetPoint.x / 100) * containerSize.width + jitterX;
      let targetY = (targetPoint.y / 100) * containerSize.height + jitterY;

      // Boundary clamping
      targetX = Math.max(5, Math.min(targetX, containerSize.width - 5));
      targetY = Math.max(5, Math.min(targetY, containerSize.height - 5));

      // Other properties
      const fontSize = 9 + Math.random() * 8;
      const finalScale = 0.65 + Math.random() * 0.3;
      const delay = Math.random() * (animationDuration * 1000 * 0.6);
      const wordColor = hexToRgba(baseColor, 0.7 + Math.random() * 0.3);

      newWordElements.push({
        id: `word-${i}-${Date.now()}`,
        word,
        initialX,
        initialY,
        targetX,
        targetY,
        delay,
        fontSize,
        finalScale,
        color: wordColor,
      });
    }

    setWordElements(newWordElements);

    const animationStartTimeout = setTimeout(() => {
      console.log("Starting animation...");
      setStartAnimation(true);
    }, 50);

    return () => {
      clearTimeout(animationStartTimeout);
    };
  }, [isPlaying, internalPoints, words, containerSize, animationDuration, baseColor, hexToRgba]);

  return (
    <div
      ref={containerRef}
      className="word-garden-canvas"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%', 
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      {wordElements.map((element) => {
        const transform = startAnimation
          ? `translate(${element.targetX}px, ${element.targetY}px) scale(${element.finalScale})`
          : `translate(${element.initialX}px, ${element.initialY}px) scale(0.1)`;

        const opacity = startAnimation ? 0.85 : 0;

        const transition = startAnimation
          ? `transform ${animationDuration}s cubic-bezier(0.25, 1, 0.5, 1) ${element.delay}ms, opacity ${animationDuration * 0.6}s ease-out ${element.delay}ms`
          : 'none';

        return (
          <span
            key={element.id}
            style={{
              position: 'absolute',
              whiteSpace: 'nowrap',
              cursor: 'default',
              fontSize: `${element.fontSize}px`,
              color: element.color,
              opacity: opacity,
              transform: transform,
              transition: transition,
              left: 0,
              top: 0,
              willChange: 'transform, opacity',
            }}
          >
            {element.word}
          </span>
        );
      })}
    </div>
  );
};

export default WordGarden;
