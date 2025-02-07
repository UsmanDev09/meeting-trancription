import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onStop: () => void;
}

export function VideoPreview({ videoRef, onStop }: VideoPreviewProps) {
  return (
    <div className="fixed bottom-4 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-full object-cover"
      />
      <Button
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 h-8 w-8 p-0"
        onClick={onStop}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
