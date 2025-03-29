
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
import { Eye } from "lucide-react";

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
      </DialogContent>
    </Dialog>
  );
};

export default EdgePreviewDialog;
