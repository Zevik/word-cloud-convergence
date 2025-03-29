
import { Button } from "@/components/ui/button";
import { PlaybackControlsProps } from "@/types";
import { RefreshCw, Video, Eye } from "lucide-react";

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  onRestart,
  onVideoExport,
  onViewPoints,
  canPlay
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button 
        variant="outline" 
        onClick={onRestart} 
        disabled={!canPlay}
        className=""
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Restart
      </Button>
      <Button 
        variant="outline" 
        onClick={onVideoExport} 
        disabled={!canPlay}
        className=""
      >
        <Video className="mr-2 h-4 w-4" />
        Export Video
      </Button>
      <Button 
        variant="outline" 
        onClick={onViewPoints} 
        disabled={!canPlay}
        className="col-span-2"
      >
        <Eye className="mr-2 h-4 w-4" />
        View Points
      </Button>
    </div>
  );
};

export default PlaybackControls;
