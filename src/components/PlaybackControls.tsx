
import { Button } from "@/components/ui/button";
import { PlaybackControlsProps } from "@/types";
import { RefreshCw, Download, Eye } from "lucide-react";

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  onRestart,
  onExport,
  onViewPoints,
  canPlay
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        onClick={onRestart} 
        disabled={!canPlay}
        className="flex-1"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Restart
      </Button>
      <Button 
        variant="outline" 
        onClick={onExport} 
        disabled={!canPlay}
        className="flex-1"
      >
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button 
        variant="outline" 
        onClick={onViewPoints} 
        disabled={!canPlay}
        className="flex-1"
      >
        <Eye className="mr-2 h-4 w-4" />
        View Points
      </Button>
    </div>
  );
};

export default PlaybackControls;
