
import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ImageUploadArea from "@/components/ImageUploadArea";
import ProcessingControls from "@/components/ProcessingControls";
import AnimationCanvas from "@/components/AnimationCanvas";
import PlaybackControls from "@/components/PlaybackControls";
import { processImageAndGetPoints } from "@/utils/imageProcessor";
import { exportToPng } from "@/utils/exportUtils";
import { Point, ProcessingResult } from "@/types";

const DEFAULT_WORDS = [
  "בריאות", "שלווה", "אושר", "אהבה", "הצלחה", "שמחה", "שפע", "חוכמה", 
  "עוצמה", "יצירתיות", "נדיבות", "חיוך", "תקווה", "סבלנות", "אמונה", 
  "קלילות", "הרמוניה", "הגשמה", "ביטחון", "שקט", "ידידות", "משפחה", 
  "אמת", "למידה", "סקרנות", "חופש", "הנאה", "הצלחה", "ענווה", "חוזק"
];

const BASE_COLOR = "#90ee90"; // Light green

const Index = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [edgeImageUrl, setEdgeImageUrl] = useState<string | null>(null);
  const [internalPoints, setInternalPoints] = useState<Point[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);
  const animationContainerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (file: File) => {
    setFile(file);
    setImageUrl(URL.createObjectURL(file));
    setIsPlaying(false);
    setInternalPoints([]);
  };

  const handleDurationChange = (duration: number) => {
    setAnimationDuration(duration);
  };

  const handleProcess = async () => {
    if (!file) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setIsPlaying(false);

    try {
      const result: ProcessingResult = await processImageAndGetPoints(file);
      setInternalPoints(result.internalPoints);
      setEdgeImageUrl(result.edgeImageUrl);
      
      if (result.internalPoints.length === 0) {
        toast({
          title: "Processing failed",
          description: "Couldn't detect a clear shape. Try a different image.",
          variant: "destructive",
        });
        return;
      }
      
      // Start animation after successful processing
      setIsPlaying(true);
      
      toast({
        title: "Processing complete",
        description: `Created animation with ${result.internalPoints.length} points`,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Processing failed",
        description: "An error occurred while processing the image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    // Use a small timeout to ensure React has time to update the state
    setTimeout(() => {
      setRestartTrigger(prev => prev + 1);
      setIsPlaying(true);
    }, 50);
    
    toast({
      title: "Animation restarted",
    });
  }, [toast]);

  const handleExport = useCallback(async () => {
    try {
      await exportToPng(animationContainerRef.current);
      toast({
        title: "Export successful",
        description: "Your word cloud has been downloaded",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export the image",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Word Cloud Convergence</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Upload an image, and watch as words converge to form its shape
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">Upload</h2>
              <ImageUploadArea onImageUpload={handleImageUpload} imageUrl={imageUrl} />
              
              <Separator />
              
              <h2 className="text-xl font-semibold">Controls</h2>
              <ProcessingControls
                onProcess={handleProcess}
                isProcessing={isProcessing}
                onDurationChange={handleDurationChange}
                animationDuration={animationDuration}
                hasImage={!!imageUrl}
              />
              
              <Separator />
              
              <PlaybackControls
                onRestart={handleRestart}
                onExport={handleExport}
                canPlay={internalPoints.length > 0 && !isProcessing}
              />
            </Card>
          </div>
          
          <Card className="md:col-span-3 p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Animation Preview</h2>
            <div className="flex-1 relative min-h-[400px]">
              <AnimationCanvas
                internalPoints={internalPoints}
                words={DEFAULT_WORDS}
                color={BASE_COLOR}
                animationDuration={animationDuration}
                isPlaying={isPlaying && restartTrigger >= 0}
                containerRef={animationContainerRef}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
