"use client";

import { useState, useRef } from "react";
import { Video, Download, Mic, AlignCenter, Check, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImportDialog } from "./importDialog";
import { MediaLibraryDialog } from "./mediaLibraryDialog";
import { VideoPreview } from "./videoPreview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  date: Date;
}

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [recordings, setRecordings] = useState<MediaFile[]>([]);
  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const startRecording = async (type: "video") => {
    try {
      const constraints ={ video: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (type === "video" && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const newRecording: MediaFile = {
          id: Date.now().toString(),
          name: `Recording_${new Date().toLocaleString()}`,
          url: url,
          date: new Date(),
          type: type,
        };
        setRecordings((prev) => [...prev, newRecording]);
      };

      recorder.start();
      setMediaRecorder(recorder);
       setIsVideoRecording(true);
    } catch (err) {
      console.error(`Error accessing ${type} devices:`, err);
    }
  };

  const stopRecording = (type: "video") => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsVideoRecording(false);
      if (type === "video" && videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles: MediaFile[] = Array.from(files).map((file) => ({
      id: Date.now().toString(),
      name: file.name,
      type: file.type.includes("video") ? "video" : "audio",
      url: URL.createObjectURL(file),
      date: new Date(),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const deleteFile = (id: string, isRecording: boolean) => {
    if (isRecording) {
      setRecordings((prev) => prev.filter((rec) => rec.id !== id));
    } else {
      setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    }
  };

  const sections = [
    "Home",
    "My Conversations",
    "All Conversations",
    "Shared with Me",
    "Trash",
  ];

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-xl gap-2">
                <Menu className="w-5 h-5" />
                {activeSection}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {sections.map((section) => (
                <DropdownMenuItem
                  key={section}
                  onClick={() => onSectionChange(section)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  {section}
                  {activeSection === section && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-xl",
              isVideoRecording && "bg-red-100 text-red-600"
            )}
            onClick={
              isVideoRecording
                ? () => stopRecording("video")
                : () => startRecording("video")
            }
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            className="rounded-xl"
            onClick={() => setIsImportOpen(true)}
          >
            <Download className="w-5 h-5 mr-2" />
            Import
          </Button>
          <Button
            className={cn(
              "rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
            )}
            onClick={()=>{router.push('/note')}}
          >
            <Mic className="w-5 h-5 mr-2" />
            {isRecording ? "Stop Recording" : "Record"}
          </Button>
          {(uploadedFiles.length > 0 || recordings.length > 0) && (
            <Button
              variant="outline"
              onClick={() => setIsMediaLibraryOpen(true)}
            >
              Library
            </Button>
          )}
        </div> */}
      </header>
      {isVideoRecording && (
        <VideoPreview
          videoRef={videoRef}
          onStop={() => stopRecording("video")}
        />
      )}
      <ImportDialog
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        dragActive={dragActive}
        onDrag={handleDrag}
        onDrop={handleDrop}
        uploadedFiles={uploadedFiles}
        onFileSelect={handleFiles}
        onDelete={deleteFile}
      />
      <MediaLibraryDialog
        isOpen={isMediaLibraryOpen}
        onOpenChange={setIsMediaLibraryOpen}
        mediaType={mediaType}
        onMediaTypeChange={(value: "audio" | "video") => setMediaType(value)}
        recordings={recordings}
        uploadedFiles={uploadedFiles}
        onDelete={deleteFile}
      />
    </>
  );
}
