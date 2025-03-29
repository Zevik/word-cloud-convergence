
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProcessingControlsProps, ColorMode } from "@/types";
import { Play, Loader2, Palette } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const ProcessingControls: React.FC<ProcessingControlsProps> = ({
  onProcess,
  isProcessing,
  onDurationChange,
  animationDuration,
  hasImage,
  maxPoints,
  onMaxPointsChange,
  colorMode,
  onColorModeChange,
  color,
  onColorChange,
  customColors,
  onCustomColorsChange,
  backgroundColor,
  onBackgroundColorChange
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

      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">Maximum Points</h3>
          <span className="text-sm text-muted-foreground">{maxPoints}</span>
        </div>
        <Select 
          value={maxPoints.toString()} 
          onValueChange={(value) => onMaxPointsChange(parseInt(value))}
          disabled={isProcessing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select points" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100">100 points</SelectItem>
            <SelectItem value="250">250 points</SelectItem>
            <SelectItem value="500">500 points</SelectItem>
            <SelectItem value="750">750 points</SelectItem>
            <SelectItem value="1000">1000 points</SelectItem>
            <SelectItem value="1500">1500 points</SelectItem>
            <SelectItem value="2000">2000 points</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">More points create a more detailed shape but may affect performance.</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Color Mode</Label>
        <Select 
          value={colorMode} 
          onValueChange={(value) => onColorModeChange(value as ColorMode)}
          disabled={isProcessing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select color mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Color</SelectItem>
            <SelectItem value="rainbow">Rainbow</SelectItem>
            <SelectItem value="custom">Custom Colors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {colorMode === 'single' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Word Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-10 p-1"
              disabled={isProcessing}
            />
            <div 
              className="h-10 flex-1 rounded border"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>
      )}

      {colorMode === 'custom' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Custom Colors</Label>
          <div className="grid grid-cols-5 gap-2">
            {customColors.map((customColor, index) => (
              <Input
                key={index}
                type="color"
                value={customColor}
                onChange={(e) => {
                  const newColors = [...customColors];
                  newColors[index] = e.target.value;
                  onCustomColorsChange(newColors);
                }}
                className="w-full h-8 p-1"
                disabled={isProcessing}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">Background</Label>
        <div className="flex gap-2 items-center">
          <Select 
            value={backgroundColor === 'transparent' ? 'transparent' : 'color'} 
            onValueChange={(value) => onBackgroundColorChange(value === 'transparent' ? 'transparent' : backgroundColor !== 'transparent' ? backgroundColor : '#ffffff')}
            disabled={isProcessing}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select background" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transparent">Transparent</SelectItem>
              <SelectItem value="color">Color</SelectItem>
            </SelectContent>
          </Select>
          
          {backgroundColor !== 'transparent' && (
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="w-12 h-10 p-1"
              disabled={isProcessing}
            />
          )}
        </div>
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
