
import { Point, ProcessingResult } from "@/types";

// Apply Grayscale, Blur, and Canny Edge Detection
const applyCannyEdgeDetection = (imageData: ImageData): ImageData => {
  // Simplified edge detection for client-side implementation
  // This is a basic implementation - a real app would use a more robust algorithm
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

// Find the main contour using Moore-Neighbor tracing
const findContourMooreNeighbor = (edgeImageData: ImageData): Point[] => {
  const data = edgeImageData.data;
  const width = edgeImageData.width;
  const height = edgeImageData.height;
  const visited = new Set<string>();
  const contour: Point[] = [];
  
  // Find the first white pixel (edge pixel)
  let startX = -1, startY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx] === 255) { // White pixel (edge)
        startX = x;
        startY = y;
        break;
      }
    }
    if (startX !== -1) break;
  }
  
  if (startX === -1) return []; // No edge found
  
  // Moore-Neighbor tracing algorithm (simplified)
  const directions = [
    [0, -1], [1, -1], [1, 0], [1, 1], 
    [0, 1], [-1, 1], [-1, 0], [-1, -1]
  ];
  
  let x = startX;
  let y = startY;
  let dir = 0; // Start by going right
  
  do {
    const key = `${x},${y}`;
    if (!visited.has(key)) {
      visited.add(key);
      contour.push({ 
        x: (x / width) * 100, 
        y: (y / height) * 100 
      });
    }
    
    // Check if the next pixel in the current direction is white
    let found = false;
    for (let i = 0; i < 8; i++) {
      const nextDir = (dir + i) % 8;
      const [dx, dy] = directions[nextDir];
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const idx = (ny * width + nx) * 4;
        if (data[idx] === 255) { // White pixel (edge)
          x = nx;
          y = ny;
          dir = nextDir;
          found = true;
          break;
        }
      }
    }
    
    if (!found) break; // Isolated point or error
    
  } while (x !== startX || y !== startY);
  
  // Simplify the contour to reduce points (optional)
  // The random walk sampling inside will be more efficient with fewer points
  return contour;
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

// Generate internal points using Rejection Sampling
const generateInternalPointsRejection = (
  contourPoints: Point[], 
  count: number = 100
): Point[] => {
  if (contourPoints.length === 0) return [];
  
  // Find bounding box of the contour
  let minX = 100, minY = 100, maxX = 0, maxY = 0;
  for (const point of contourPoints) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  
  const internalPoints: Point[] = [];
  let attempts = 0;
  const maxAttempts = count * 10; // Avoid infinite loop
  
  while (internalPoints.length < count && attempts < maxAttempts) {
    attempts++;
    
    // Generate a random point inside the bounding box
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Check if the point is inside the contour
    if (isPointInsidePolygon({ x, y }, contourPoints)) {
      internalPoints.push({ x, y });
    }
  }
  
  return internalPoints;
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
          const maxSize = 600; // Max dimension for processing
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
          
          // Find contour
          const contourPoints = findContourMooreNeighbor(edgeData);
          
          // Generate internal points
          const internalPoints = generateInternalPointsRejection(contourPoints, 350);
          
          // Return the result
          resolve({
            internalPoints,
            contourPoints,
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
