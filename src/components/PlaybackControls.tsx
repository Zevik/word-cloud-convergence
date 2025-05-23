
import { Button } from "@/components/ui/button";
import { PlaybackControlsProps } from "@/types";
import { RefreshCw, Video, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  onRestart,
  onVideoExport,
  onViewPoints,
  canPlay
}) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleVideoExport = async () => {
    try {
      setIsExporting(true);
      
      // First restart the animation to ensure we capture from the beginning
      onRestart();
      
      // Small delay to ensure animation has fully restarted before we begin capture
      setTimeout(async () => {
        try {
          await onVideoExport();
        } catch (error) {
          console.error("Error in video export:", error);
          toast({
            title: "Export Failed",
            description: error instanceof Error ? error.message : "An unknown error occurred",
            variant: "destructive",
          });
          setIsExporting(false);
        }
      }, 100);
    } catch (error) {
      console.error("Error in video export:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button 
        variant="outline" 
        onClick={onRestart} 
        disabled={!canPlay || isExporting}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Restart
      </Button>
      <Button 
        variant="outline" 
        onClick={handleVideoExport} 
        disabled={!canPlay || isExporting}
      >
        {isExporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Video className="mr-2 h-4 w-4" />
        )}
        {isExporting ? "Exporting..." : "Export Video"}
      </Button>
      <Button 
        variant="outline" 
        onClick={onViewPoints} 
        disabled={!canPlay || isExporting}
        className="col-span-2"
      >
        <Eye className="mr-2 h-4 w-4" />
        View Points
      </Button>
    </div>
  );
};

export default PlaybackControls;
