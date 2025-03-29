
import html2canvas from 'html2canvas';

export const exportToPng = async (element: HTMLElement | null): Promise<void> => {
  if (!element) {
    throw new Error('No element provided for export');
  }
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null, // Transparent background
      scale: 2, // Higher quality
      logging: false
    });
    
    // Convert to PNG and download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `word-cloud-${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
};

export const exportToVideo = async (
  element: HTMLElement | null, 
  duration: number = 5,
  onStart?: () => void,
  onFinish?: () => void
): Promise<void> => {
  if (!element) {
    throw new Error('No element provided for export');
  }
  
  try {
    // Call onStart callback if provided
    if (onStart) onStart();
    
    // Get media stream from the element
    const stream = element.captureStream ? element.captureStream(30) : null;
    
    if (!stream) {
      throw new Error('Cannot capture stream from element');
    }
    
    // Create media recorder
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000 // 5 Mbps
    });
    
    const chunks: Blob[] = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    recorder.onstop = () => {
      // Create a blob from all chunks
      const blob = new Blob(chunks, { type: 'video/webm' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `word-cloud-animation-${new Date().getTime()}.webm`;
      link.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      // Call onFinish callback if provided
      if (onFinish) onFinish();
    };
    
    // Start recording
    recorder.start();
    
    // Stop after duration + a small buffer
    setTimeout(() => {
      recorder.stop();
    }, (duration * 1000) + 500);
    
  } catch (error) {
    console.error('Error exporting to video:', error);
    if (onFinish) onFinish();
    throw error;
  }
};
