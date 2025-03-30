
import html2canvas from 'html2canvas';

export const exportToVideo = async (
  element: HTMLElement | null, 
  duration: number = 5,
  onStart?: () => void,
  onFinish?: (blob?: Blob) => void,
  onError?: (error: Error) => void
): Promise<void> => {
  if (!element) {
    const error = new Error('No element provided for export');
    console.error(error);
    if (onError) onError(error);
    return;
  }

  // --- Configuration ---
  const frameRate = 60; // Higher frame rate for smoother animation
  const totalFrames = duration * frameRate;
  const interval = 1000 / frameRate; // milliseconds between frames

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let recordingCanvas: HTMLCanvasElement | null = null;
  let recordingCtx: CanvasRenderingContext2D | null = null;
  let frameCount = 0;
  let animationFrameId: number | null = null;
  const chunks: Blob[] = [];
  let startTime: number;

  const cleanup = () => {
    console.log("Cleaning up resources...");
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (recorder && recorder.state === 'recording') {
      try {
        recorder.stop();
      } catch (e) {
        console.warn("Error stopping recorder during cleanup:", e);
      }
    }
    stream?.getTracks().forEach(track => track.stop());
    recordingCanvas = null;
    recordingCtx = null;
    recorder = null;
    stream = null;
    chunks.length = 0; // Clear chunks array
    frameCount = 0;
  };

  try {
    console.log(`Starting video export: ${duration}s, ${frameRate}fps, ${totalFrames} frames`);
    if (onStart) onStart();

    // --- Setup Recording Canvas ---
    // Use element's dimensions for the recording canvas
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) {
      throw new Error("Element has zero dimensions, cannot capture.");
    }

    recordingCanvas = document.createElement('canvas');
    recordingCanvas.width = width;
    recordingCanvas.height = height;
    // Enable alpha channel for transparency
    recordingCtx = recordingCanvas.getContext('2d', { alpha: true });

    if (!recordingCtx) {
      throw new Error('Failed to get 2D context for recording canvas');
    }

    // --- Setup MediaRecorder ---
    stream = recordingCanvas.captureStream(frameRate);
    const options = {
      mimeType: 'video/webm;codecs=vp9', // VP9 supports alpha channel
      videoBitsPerSecond: 8000000, // 8 Mbps for better quality
    };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.warn(`${options.mimeType} not supported, trying default.`);
      options.mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
         throw new Error('No supported video/webm mimeType found for MediaRecorder');
      }
    }
    console.log("Using mimeType:", options.mimeType);

    recorder = new MediaRecorder(stream, options);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
        console.log(`Chunk received: ${e.data.size} bytes`);
      } else {
        console.warn("Received empty data chunk.");
      }
    };

    recorder.onstop = () => {
      console.log(`Recorder stopped. Total chunks: ${chunks.length}`);
      if (chunks.length === 0) {
        console.error("Recording stopped, but no data chunks were generated.");
        const error = new Error("No video data was recorded.");
        if (onError) onError(error);
        cleanup(); // Ensure cleanup even on error
        return;
      }

      const blob = new Blob(chunks, { type: options.mimeType });
      console.log(`Video blob created: ${blob.size} bytes, type: ${blob.type}`);

      if (blob.size < 1000) {
         console.error(`Generated video is too small (${blob.size} bytes), likely corrupt or empty.`);
         const error = new Error("Generated video is too small or empty.");
         if (onError) onError(error);
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `word-cloud-animation-${Date.now()}.webm`;
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        console.log("Video download initiated.");
        if (onFinish) onFinish(blob);
      }
      cleanup(); // Final cleanup after processing
    };

    recorder.onerror = (event) => {
      console.error("MediaRecorder error:", event);
      // Attempt to access specific error details if available
      let errorMessage = 'MediaRecorder error';
      if ('error' in event && event.error instanceof Error) {
          errorMessage = `MediaRecorder error: ${event.error.name} - ${event.error.message}`;
      }
      const error = new Error(errorMessage);
      if (onError) onError(error);
      cleanup();
    };

    // --- Animation Frame Loop ---
    startTime = performance.now();
    const endTime = startTime + (duration * 1000); // When to stop capturing

    const captureFrame = async (currentTime: number) => {
      // Check if recorder is still active
      if (!recorder || recorder.state !== 'recording') {
        console.log("Recorder not active, stopping frame capture.");
        cleanup();
        return;
      }

      // Stop if we've reached the end time
      if (currentTime >= endTime) {
        console.log("Reached end time, stopping recorder...");
        if (recorder && recorder.state === 'recording') {
          recorder.stop();
        } else {
          cleanup();
        }
        return;
      }

      try {
        // Capture current state of the element
        const capturedCanvas = await html2canvas(element, {
          backgroundColor: null, // Capture transparency
          scale: 1, // Use scale 1 for performance
          logging: false,
          useCORS: true,
          allowTaint: true,
          width: width,
          height: height,
          x: 0,
          y: 0,
          scrollX: -window.scrollX,
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight,
        });

        // Draw captured frame onto the recording canvas with transparency
        recordingCtx.clearRect(0, 0, width, height); // Clear previous frame (preserves transparency)
        recordingCtx.drawImage(capturedCanvas, 0, 0, width, height);

        frameCount++;
        
        if (frameCount % 10 === 0) { // Log less frequently to reduce console spam
          console.log(`Captured frame ${frameCount}, elapsed: ${((currentTime - startTime)/1000).toFixed(1)}s/${duration}s`);
        }

        // Continue capturing frames
        animationFrameId = requestAnimationFrame(captureFrame);
      } catch (error) {
        console.error('Error capturing frame with html2canvas:', error);
        const err = error instanceof Error ? error : new Error(String(error));
        if (onError) onError(err);
        cleanup(); // Stop recording on error
      }
    };

    // --- Start Recording ---
    console.log("Starting recorder...");
    recorder.start();
    console.log("Recorder state:", recorder.state);
    animationFrameId = requestAnimationFrame(captureFrame); // Start the capture loop immediately

  } catch (error) {
    console.error('Error during video export setup:', error);
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) onError(err);
    cleanup(); // Ensure cleanup on setup error
  }
};
