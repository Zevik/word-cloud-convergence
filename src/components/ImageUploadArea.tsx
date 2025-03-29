
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageUploadAreaProps } from '@/types';
import { UploadCloud } from 'lucide-react';

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({ onImageUpload, imageUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onImageUpload(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-all ${
        isDragging ? 'border-primary bg-secondary/30' : 'border-border hover:border-primary/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        {imageUrl ? (
          <div className="relative w-full max-w-[300px] mx-auto">
            <img
              src={imageUrl}
              alt="Uploaded shape"
              className="w-full h-auto rounded-md object-contain max-h-[200px]"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleButtonClick}
            >
              Replace Image
            </Button>
          </div>
        ) : (
          <>
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-medium">Upload an image</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop an image, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 5MB
              </p>
            </div>
            <Button variant="outline" onClick={handleButtonClick}>
              Select Image
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploadArea;
