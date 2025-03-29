
import { Point, ProcessingResult } from "@/types";

// Apply Grayscale, Blur, and Canny Edge Detection
const applyCannyEdgeDetection = (imageData: ImageData): ImageData => {
  // Simplified edge detection for client-side implementation
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
  
  // Apply a simple edge detection (difference between neighboring pixels)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const gx = 
        -1 * output[idx - 4 - width * 4] + 1 * output[idx + 4 - width * 4] +
        -2 * output[idx - 4] + 2 * output[idx + 4] +
        -1 * output[idx - 4 + width * 4] + 1 * output[idx + 4 + width * 4];
      
      const gy = 
        -1 * output[idx - 4 - width * 4] - 2 * output[idx - width * 4] - 1 * output[idx + 4 - width * 4] +
        1 * output[idx - 4 + width * 4] + 2 * output[idx + width * 4] + 1 * output[idx + 4 + width * 4];
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      // Thresholding
      data[idx] = data[idx + 1] = data[idx + 2] = magnitude > 40 ? 255 : 0;
      data[idx + 3] = 255;
    }
  }
  
  return new ImageData(data, width, height);
};

// Check if a point is inside the polygon
const isPointInsidePolygon = (point: Point, polygon: Point[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const intersect = ((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
      (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Generate internal points using direct pixel sampling
const generateInternalPoints = (imageData: ImageData, count: number = 500): Point[] => {
  const { width, height, data } = imageData;
  const points: Point[] = [];
  const threshold = 128;
  
  // Determine the skip factor based on image size and desired point count
  const totalPixels = width * height;
  const skipFactor = Math.max(1, Math.floor(Math.sqrt(totalPixels / count)));
  
  // Sample dark pixels directly from the edge-detected image
  for (let y = 0; y < height; y += skipFactor) {
    for (let x = 0; x < width; x += skipFactor) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      if (brightness < threshold) {
        // Convert to normalized coordinates (0-100)
        points.push({
          x: (x / width) * 100,
          y: (y / height) * 100
        });
        
        if (points.length >= count) break;
      }
    }
    if (points.length >= count) break;
  }
  
  // If we don't have enough points, fill with some random ones inside the image
  if (points.length < count / 2) {
    for (let i = points.length; i < count; i++) {
      points.push({
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    }
  }
  
  return points;
};

// Main processing function
export const processImageAndGetPoints = async (
  imageFile: File
): Promise<ProcessingResult> => {
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
          
          // Set canvas size
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
          
          // Process the image with edge detection
          const edgeData = applyCannyEdgeDetection(imageData);
          
          // Put edge data back to canvas for visualization
          ctx.putImageData(edgeData, 0, 0);
          const edgeImageUrl = canvas.toDataURL('image/png');
          
          // Generate internal points by directly sampling dark pixels
          const internalPoints = generateInternalPoints(edgeData, 350);
          
          console.log(`Generated ${internalPoints.length} internal points`);
          
          // Return the result
          resolve({
            internalPoints,
            contourPoints: [], // Not used in this direct sampling approach
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
