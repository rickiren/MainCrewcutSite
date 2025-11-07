import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImageUploaderProps {
  onImageUpload: (imageData: string, fileName: string) => void;
  onImageRemove: () => void;
  uploadedImage: string | null;
  isAnalyzing?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  onImageRemove,
  uploadedImage,
  isAnalyzing = false,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result, file.name);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  if (uploadedImage) {
    return (
      <Card className="relative overflow-hidden">
        <img
          src={uploadedImage}
          alt="Uploaded design"
          className="w-full h-48 object-cover"
        />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Analyzing design...</p>
            </div>
          </div>
        )}
        <Button
          onClick={onImageRemove}
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </Card>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="image-upload"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />
      <label htmlFor="image-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Upload a design screenshot
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop or click to browse
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Choose Image
          </Button>
        </div>
      </label>
    </div>
  );
};
