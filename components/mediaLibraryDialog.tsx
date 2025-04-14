import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaList } from "./mediaList";
interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  date: Date;
}
interface MediaLibraryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mediaType: "audio" | "video";
  onMediaTypeChange: (value: "audio" | "video") => void;
  recordings: MediaFile[];
  uploadedFiles: MediaFile[];
  onDelete: (id: string, isRecording: boolean) => void;
}

export function MediaLibraryDialog({
  isOpen,
  onOpenChange,
  mediaType,
  onMediaTypeChange,
  recordings,
  uploadedFiles,
  onDelete,
}: MediaLibraryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Select value={mediaType} onValueChange={onMediaTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select media type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-4 space-y-4">
            {recordings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recordings</h4>
                <MediaList
                  mediaFiles={recordings.filter(
                    (rec) => rec.type === mediaType
                  )}
                  isRecordings={true}
                  onDelete={onDelete}
                />
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                <MediaList
                  mediaFiles={uploadedFiles.filter(
                    (file) => file.type === mediaType
                  )}
                  isRecordings={false}
                  onDelete={onDelete}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
