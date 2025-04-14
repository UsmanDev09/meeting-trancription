import { Video, Mic, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  date: Date;
}
interface MediaListProps {
  mediaFiles: MediaFile[];
  isRecordings: boolean;
  onDelete: (id: string, isRecording: boolean) => void;
}

export function MediaList({
  mediaFiles,
  isRecordings,
  onDelete,
}: MediaListProps) {
  return (
    <div className="space-y-2">
      {mediaFiles.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            {file.type === "video" ? (
              <Video className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(file.url)}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700"
              onClick={() => onDelete(file.id, isRecordings)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
