
import html2canvas from 'html2canvas';

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
    
    // Create a canvas copy of the element with higher quality
    const canvas = await html2canvas(element, {
      backgroundColor: null, // Transparent background
      scale: 2, // Higher quality
      logging: false,
      useCORS: true, // Allow cross-origin images
      allowTaint: true // Allow tainted canvas
    });
    
    // Convert all words to SVG content to ensure they're included
    const wordElements = element.querySelectorAll('span');
    wordElements.forEach(word => {
      word.style.willChange = 'transform, opacity';
    });
    
    // We'll need to add the canvas to the document for the stream to work
    canvas.style.position = 'absolute';
    canvas.style.left = '-9999px';
    document.body.appendChild(canvas);
    
    // Get media stream from the canvas
    // Using a higher framerate for smoother animation
    const stream = (canvas as any).captureStream?.(60) || null;
    
    if (!stream) {
      throw new Error('Browser does not support canvas.captureStream()');
    }
    
    // Create media recorder with higher quality settings
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000 // 8 Mbps for higher quality
    });
    
    const chunks: Blob[] = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    recorder.onstop = () => {
      // Remove the canvas once we're done
      document.body.removeChild(canvas);
      
      // Create a blob from all chunks
      const blob = new Blob(chunks, { type: 'video/webm' });
      
      // Log the blob size to help diagnose issues
      console.log(`Video blob size: ${blob.size} bytes`);
      
      if (blob.size < 1000) {
        console.error('Warning: Generated video is too small, likely corrupt');
        if (onFinish) onFinish();
        throw new Error('Generated video is too small');
      }
      
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
    recorder.start(1000); // Capture in 1-second chunks for better reliability
    
    // Ensure we have at least one full duration cycle plus a small buffer
    setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    }, (duration * 1000) + 1000); // Add 1 second buffer
    
  } catch (error) {
    console.error('Error exporting to video:', error);
    if (onFinish) onFinish();
    throw error;
  }
};
