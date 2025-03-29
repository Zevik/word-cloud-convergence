
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ProcessingControlsProps } from "@/types";
import { Play, Loader2 } from "lucide-react";

const ProcessingControls: React.FC<ProcessingControlsProps> = ({
  onProcess,
  isProcessing,
  onDurationChange,
  animationDuration,
  hasImage
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">Animation Duration</h3>
          <span className="text-sm text-muted-foreground">{animationDuration}s</span>
        </div>
        <Slider
          value={[animationDuration]}
          min={2}
          max={10}
          step={0.5}
          onValueChange={(value) => onDurationChange(value[0])}
          disabled={isProcessing}
        />
      </div>

      <Button 
        onClick={onProcess} 
        disabled={isProcessing || !hasImage} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Create Animation
          </>
        )}
      </Button>
    </div>
  );
};

export default ProcessingControls;
