import { useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaList } from "./mediaList";
interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  date: Date;
}
interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dragActive: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  uploadedFiles: MediaFile[];
  onFileSelect: (files: FileList) => void;
  onDelete: (id: string, isRecording: boolean) => void;
}

export function ImportDialog({
  isOpen,
  onOpenChange,
  dragActive,
  onDrag,
  onDrop,
  uploadedFiles,
  onFileSelect,
  onDelete,
}: ImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Files</DialogTitle>
          <DialogDescription>
            Drag and drop your files here or click to browse
          </DialogDescription>
        </DialogHeader>
        <div
          className={cn(
            "mt-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8",
            dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300",
            "transition-all duration-200"
          )}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple
            accept="audio/,video/"
            onChange={(e) => e.target.files && onFileSelect(e.target.files)}
          />
          <Upload className="w-10 h-10 text-gray-400 mb-4" />
          <p className="text-sm text-gray-500 text-center">
            Drag and drop your files here, or{" "}
            <button
              onClick={() => inputRef.current?.click()}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supported formats: MP3, WAV, M4A, MP4, WEBM
          </p>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
            <MediaList
              mediaFiles={uploadedFiles}
              isRecordings={false}
              onDelete={onDelete}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
