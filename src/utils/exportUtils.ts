
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
  const frameRate = 30; // Frames per second
  const totalFrames = duration * frameRate;
  const interval = 1000 / frameRate; // milliseconds between frames

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let recordingCanvas: HTMLCanvasElement | null = null;
  let recordingCtx: CanvasRenderingContext2D | null = null;
  let frameCount = 0;
  let animationFrameId: number | null = null;
  const chunks: Blob[] = [];

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
    recordingCtx = recordingCanvas.getContext('2d', { alpha: false }); // Use alpha: false if background is solid

    if (!recordingCtx) {
      throw new Error('Failed to get 2D context for recording canvas');
    }
    // Set a background color for the recording canvas if needed
    const computedStyle = getComputedStyle(element);
    recordingCtx.fillStyle = computedStyle.backgroundColor || 'white'; // Default to white if no background
    recordingCtx.fillRect(0, 0, width, height);

    // --- Setup MediaRecorder ---
    stream = recordingCanvas.captureStream(frameRate);
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000, // 5 Mbps, adjust as needed
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
    let lastFrameTime = performance.now();

    const captureFrame = async (currentTime: number) => {
      // Check if recorder is still active
      if (!recorder || recorder.state !== 'recording') {
        console.log("Recorder not active, stopping frame capture.");
        cleanup();
        return;
      }

      // Ensure we run at the desired frame rate
      const elapsed = currentTime - lastFrameTime;
      if (elapsed < interval && frameCount < totalFrames) {
         animationFrameId = requestAnimationFrame(captureFrame);
         return; // Skip frame if interval hasn't passed yet
      }
      lastFrameTime = currentTime - (elapsed % interval); // Adjust lastFrameTime

      try {
        // Capture current state of the element
        const capturedCanvas = await html2canvas(element, {
          backgroundColor: null, // Capture transparency
          scale: 1, // Use scale 1 for performance, increase if quality is too low
          logging: false,
          useCORS: true,
          allowTaint: true, // May be needed depending on content
          width: width,
          height: height,
          x: 0,
          y: 0,
          scrollX: -window.scrollX, // Adjust for window scroll
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.offsetWidth, // Provide window dimensions
          windowHeight: document.documentElement.offsetHeight,
        });

        // Draw captured frame onto the recording canvas
        recordingCtx.clearRect(0, 0, width, height); // Clear previous frame
        // Redraw background if needed
        recordingCtx.fillStyle = computedStyle.backgroundColor || 'white';
        recordingCtx.fillRect(0, 0, width, height);
        // Draw the captured content
        recordingCtx.drawImage(capturedCanvas, 0, 0, width, height);

        frameCount++;
        console.log(`Captured frame ${frameCount}/${totalFrames}`);

        // Continue or stop recording
        if (frameCount < totalFrames) {
          animationFrameId = requestAnimationFrame(captureFrame);
        } else {
          console.log("Reached total frames, stopping recorder...");
          if (recorder && recorder.state === 'recording') {
            recorder.stop(); // This will trigger onstop event
          } else {
            console.warn("Recorder was not in recording state when trying to stop.");
            cleanup(); // Manually cleanup if recorder wasn't recording
          }
        }
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
    animationFrameId = requestAnimationFrame(captureFrame); // Start the capture loop

  } catch (error) {
    console.error('Error during video export setup:', error);
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) onError(err);
    cleanup(); // Ensure cleanup on setup error
  }
};
