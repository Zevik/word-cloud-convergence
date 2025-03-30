
import { Button } from "@/components/ui/button";
import { PlaybackControlsProps } from "@/types";
import { RefreshCw, Video, Eye, Loader2 } from "lucide-react";
import { useState } from "react";

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  onRestart,
  onVideoExport,
  onViewPoints,
  canPlay
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleVideoExport = async () => {
    try {
      setIsExporting(true);
      await onVideoExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button 
        variant="outline" 
        onClick={onRestart} 
        disabled={!canPlay || isExporting}
        className=""
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Restart
      </Button>
      <Button 
        variant="outline" 
        onClick={handleVideoExport} 
        disabled={!canPlay || isExporting}
        className=""
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
