
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EdgePreviewDialogProps {
  edgeImageUrl: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EdgePreviewDialog: React.FC<EdgePreviewDialogProps> = ({
  edgeImageUrl,
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edge Detection Preview</DialogTitle>
          <DialogDescription>
            This shows the edge detection result used to create the word cloud shape. 
            The black pixels in this image represent the areas where words will appear.
            Each black pixel generates a potential position for a word in the animation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-2">
          {edgeImageUrl ? (
            <img 
              src={edgeImageUrl} 
              alt="Edge Detection Result" 
              className="max-w-full border border-border rounded-md"
            />
          ) : (
            <div className="text-muted-foreground p-4">
              No edge detection data available. Process an image first.
            </div>
          )}
        </div>
        <DialogClose asChild>
          <Button variant="outline" className="mt-2">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default EdgePreviewDialog;
