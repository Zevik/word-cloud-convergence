
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WordGardenProps, WordElementState } from '@/types';

const WordGarden: React.FC<WordGardenProps> = ({
  internalPoints,
  words,
  colorMode,
  color: baseColor,
  customColors = [],
  animationDuration,
  isPlaying,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordElements, setWordElements] = useState<WordElementState[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [startAnimation, setStartAnimation] = useState(false);

  // Convert hex to rgba
  const hexToRgba = useCallback((hex: string, alpha: number): string => {
    try {
      hex = hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (error) {
      console.error('Color parsing error:', error);
      return `rgba(144, 238, 144, ${alpha})`; // Default to lightgreen
    }
  }, []);

  // Get color based on color mode and index
  const getColor = useCallback((index: number) => {
    if (colorMode === 'single') {
      return hexToRgba(baseColor, 0.7 + Math.random() * 0.3);
    } else if (colorMode === 'rainbow') {
      const hue = (index * 137.508) % 360; // Golden angle approximation for nice distribution
      return `hsla(${hue}, 70%, 60%, ${0.7 + Math.random() * 0.3})`;
    } else if (colorMode === 'custom' && customColors.length > 0) {
      const selectedColor = customColors[index % customColors.length];
      return hexToRgba(selectedColor, 0.7 + Math.random() * 0.3);
    }
    // Fallback
    return hexToRgba(baseColor, 0.7 + Math.random() * 0.3);
  }, [colorMode, baseColor, customColors, hexToRgba]);

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

    console.log(`Setting up ${internalPoints.length} words for animation...`);
    setStartAnimation(false);

    const newWordElements: WordElementState[] = [];
    const numElementsToCreate = internalPoints.length;

    for (let i = 0; i < numElementsToCreate; i++) {
      const word = words[i % words.length];
      const targetPoint = internalPoints[i];

      // Initial position outside container
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(containerSize.width, containerSize.height) * (0.6 + Math.random() * 0.3);
      const initialX = containerSize.width / 2 + Math.cos(angle) * radius;
      const initialY = containerSize.height / 2 + Math.sin(angle) * radius;

      // Apply small jitter to avoid perfect alignment
      const jitterX = (Math.random() - 0.5) * 5;
      const jitterY = (Math.random() - 0.5) * 5;
      
      // Final position inside container - map from normalized coordinates (0-100) to pixels
      let targetX = (targetPoint.x / 100) * containerSize.width + jitterX;
      let targetY = (targetPoint.y / 100) * containerSize.height + jitterY;
      
      // Ensure points stay inside visible area
      targetX = Math.max(5, Math.min(targetX, containerSize.width - 5));
      targetY = Math.max(5, Math.min(targetY, containerSize.height - 5));

      // Other properties
      const fontSize = 9 + Math.random() * 8; // 9-17px range
      const finalScale = 0.65 + Math.random() * 0.3; // 0.65-0.95 scale
      const delay = Math.random() * (animationDuration * 1000 * 0.6);
      const wordColor = getColor(i);

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
  }, [isPlaying, internalPoints, words, containerSize, animationDuration, getColor]);

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
              fontWeight: 'bold',
              textShadow: '0 0 1px rgba(0,0,0,0.3)'
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
