"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Video, Mic, X } from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  date: Date;
}

interface MediaRecorderProps {
  recordings: MediaFile[];
  setRecordings: React.Dispatch<React.SetStateAction<MediaFile[]>>;
}

export function MediaRecorder({
  recordings,
  setRecordings,
}: MediaRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  const startRecording = async (type: "audio" | "video") => {
    try {
      const constraints =
        type === "audio" ? { audio: true } : { audio: true, video: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (type === "video" && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const recorder: MediaRecorder = new (window as any).MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: type === "audio" ? "audio/webm" : "video/webm",
        });
        const url = URL.createObjectURL(blob);
        const newRecording: MediaFile = {
          id: Date.now().toString(),
          name: `Recording_${new Date().toLocaleString()}`,
          type: type,
          url: url,
          date: new Date(),
        };
        setRecordings((prev) => [...prev, newRecording]);
      };

      recorder.start();
      setMediaRecorder(recorder);
      type === "audio" ? setIsRecording(true) : setIsVideoRecording(true);
    } catch (err) {
      console.error(`Error accessing ${type} devices:`, err);
    }
  };

  const stopRecording = (type: "audio" | "video") => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      type === "audio" ? setIsRecording(false) : setIsVideoRecording(false);

      if (type === "video" && videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={isVideoRecording ? "bg-red-100 text-red-600" : ""}
        onClick={
          isVideoRecording
            ? () => stopRecording("video")
            : () => startRecording("video")
        }
      >
        <Video className="w-5 h-5" />
      </Button>
      <Button
        className={isRecording ? "bg-red-600" : "bg-purple-600"}
        onClick={
          isRecording
            ? () => stopRecording("audio")
            : () => startRecording("audio")
        }
      >
        <Mic className="w-5 h-5 mr-2" />
        {isRecording ? "Stop Recording" : "Record"}
      </Button>
      {isVideoRecording && (
        <div className="video-preview">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          <Button onClick={() => stopRecording("video")}>
            <X />
          </Button>
        </div>
      )}
    </>
  );
}
