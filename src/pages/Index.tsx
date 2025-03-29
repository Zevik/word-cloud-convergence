
import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ImageUploadArea from "@/components/ImageUploadArea";
import ProcessingControls from "@/components/ProcessingControls";
import AnimationCanvas from "@/components/AnimationCanvas";
import PlaybackControls from "@/components/PlaybackControls";
import EdgePreviewDialog from "@/components/EdgePreviewDialog";
import { processImageAndGetPoints } from "@/utils/imageProcessor";
import { exportToPng, exportToVideo } from "@/utils/exportUtils";
import { Point, ProcessingResult, ColorMode } from "@/types";

const DEFAULT_WORDS = [
  "בריאות", "שלווה", "אושר", "אהבה", "הצלחה", "שמחה", "שפע", "חוכמה", 
  "עוצמה", "יצירתיות", "נדיבות", "חיוך", "תקווה", "סבלנות", "אמונה", 
  "קלילות", "הרמוניה", "הגשמה", "ביטחון", "שקט", "ידידות", "משפחה", 
  "אמת", "למידה", "סקרנות", "חופש", "הנאה", "הצלחה", "ענווה", "חוזק"
];

const DEFAULT_CUSTOM_COLORS = [
  "#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#F5FF33"
];

const Index = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [edgeImageUrl, setEdgeImageUrl] = useState<string | null>(null);
  const [internalPoints, setInternalPoints] = useState<Point[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);
  const [isEdgeDialogOpen, setIsEdgeDialogOpen] = useState(false);
  const [maxPoints, setMaxPoints] = useState(500);
  const [colorMode, setColorMode] = useState<ColorMode>('single');
  const [color, setColor] = useState('#90ee90');
  const [customColors, setCustomColors] = useState<string[]>(DEFAULT_CUSTOM_COLORS);
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent');
  
  const animationContainerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (file: File) => {
    setFile(file);
    setImageUrl(URL.createObjectURL(file));
    setIsPlaying(false);
    setInternalPoints([]);
    setEdgeImageUrl(null);
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
      const result: ProcessingResult = await processImageAndGetPoints(file, maxPoints);
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
        description: "Your word cloud has been downloaded as a PNG image",
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

  const handleVideoExport = useCallback(async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      handleRestart(); // Restart animation for the video
      
      await exportToVideo(
        animationContainerRef.current, 
        animationDuration,
        () => {
          toast({
            title: "Video recording started",
            description: "Recording your animation, please wait...",
          });
        },
        () => {
          setIsExporting(false);
          toast({
            title: "Video export complete",
            description: "Your animation has been downloaded as a WebM video",
          });
        }
      );
    } catch (error) {
      console.error("Video export error:", error);
      setIsExporting(false);
      toast({
        title: "Video export failed",
        description: "Failed to export the animation as video",
        variant: "destructive",
      });
    }
  }, [toast, animationDuration, handleRestart, isExporting]);

  const handleViewPoints = useCallback(() => {
    setIsEdgeDialogOpen(true);
  }, []);

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
                maxPoints={maxPoints}
                onMaxPointsChange={setMaxPoints}
                colorMode={colorMode}
                onColorModeChange={setColorMode}
                color={color}
                onColorChange={setColor}
                customColors={customColors}
                onCustomColorsChange={setCustomColors}
                backgroundColor={backgroundColor}
                onBackgroundColorChange={setBackgroundColor}
              />
              
              <Separator />
              
              <PlaybackControls
                onRestart={handleRestart}
                onExport={handleExport}
                onVideoExport={handleVideoExport}
                onViewPoints={handleViewPoints}
                canPlay={internalPoints.length > 0 && !isProcessing && !isExporting}
              />
            </Card>
          </div>
          
          <Card className="md:col-span-3 p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Animation Preview</h2>
            <div className="flex-1 relative min-h-[400px]">
              <AnimationCanvas
                internalPoints={internalPoints}
                words={DEFAULT_WORDS}
                colorMode={colorMode}
                color={color}
                customColors={customColors}
                animationDuration={animationDuration}
                isPlaying={isPlaying && restartTrigger >= 0}
                containerRef={animationContainerRef}
                backgroundColor={backgroundColor}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Edge Detection Preview Dialog */}
      <EdgePreviewDialog 
        edgeImageUrl={edgeImageUrl}
        isOpen={isEdgeDialogOpen}
        onOpenChange={setIsEdgeDialogOpen}
      />
    </div>
  );
};

export default Index;
