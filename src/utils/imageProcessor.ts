
import { Point, ProcessingResult } from "@/types";

// Apply Grayscale and detect dark regions for shape formation
const processImageForEdgeDetection = (imageData: ImageData): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  
  // First, convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
    output[i] = output[i + 1] = output[i + 2] = gray;
    output[i + 3] = 255;
  }
  
  // Simple threshold-based detection
  for (let i = 0; i < data.length; i += 4) {
    const brightness = output[i]; // All RGB channels are the same in grayscale
    // Invert the image so the shape is black (0) and background is white (255)
    data[i] = data[i + 1] = data[i + 2] = brightness < 128 ? 0 : 255;
    data[i + 3] = 255;
  }
  
  return new ImageData(data, width, height);
};

// Generate internal points by sampling dark pixels with controlled density
const generateInternalPoints = (imageData: ImageData, maxPoints: number = 1000): Point[] => {
  const { width, height, data } = imageData;
  const points: Point[] = [];
  
  // Calculate a skip factor based on the image size and desired density
  // We want a reasonable distribution across the image
  const skipFactor = Math.max(1, Math.floor(Math.sqrt(width * height / maxPoints)));
  
  // Sample dark pixels directly from the processed image
  for (let y = 0; y < height; y += skipFactor) {
    for (let x = 0; x < width; x += skipFactor) {
      const idx = (y * width + x) * 4;
      // In our processing, dark pixels (black) are where we want words
      if (data[idx] < 128) {
        // Convert to normalized coordinates (0-100 range)
        points.push({
          x: (x / width) * 100,
          y: (y / height) * 100
        });
      }
    }
  }
  
  // If we have too many points, randomly select a subset
  if (points.length > maxPoints) {
    points.sort(() => 0.5 - Math.random()); // Shuffle
    return points.slice(0, maxPoints);
  }
  
  // If we don't have enough points, we'll work with what we have
  return points;
};

// Main processing function
export const processImageAndGetPoints = async (imageFile: File): Promise<ProcessingResult> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas to process the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          // Set canvas size with a reasonable max dimension for performance
          const maxSize = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > maxSize) {
            height = Math.floor(height * (maxSize / width));
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.floor(width * (maxSize / height));
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, width, height);
          
          // Process the image to detect edges/shapes
          const processedData = processImageForEdgeDetection(imageData);
          
          // Put processed data back to canvas for visualization
          ctx.putImageData(processedData, 0, 0);
          const edgeImageUrl = canvas.toDataURL('image/png');
          
          // Generate points from the processed image
          const internalPoints = generateInternalPoints(processedData, 350);
          
          console.log(`Generated ${internalPoints.length} internal points`);
          
          // Return the result
          resolve({
            internalPoints,
            contourPoints: [], // Not used in this approach
            originalImageUrl: e.target?.result as string,
            edgeImageUrl
          });
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load the image'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read the file'));
      };
      
      reader.readAsDataURL(imageFile);
    } catch (error) {
      reject(error);
    }
  });
};
