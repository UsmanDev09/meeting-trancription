"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { format } from "date-fns";

interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  date: Date;
}

export default function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<MediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      try {
        mediaRecorder.current.stop();
        mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error("Error during cleanup:", err);
      }
    }
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const newRecording: MediaFile = {
          id: Date.now().toString(),
          name: `Recording_${format(new Date(), "MMM_d_yyyy_h_mm_a")}`,
          url,
          date: new Date(),
          type: "audio",
        };

        setRecordings((prev) => [...prev, newRecording]);
        chunks.current = [];
      };

      mediaRecorder.current.onstart = () => {
        setIsRecording(true);
        setDuration(0);
      };

      mediaRecorder.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(err instanceof Error ? err.message : "Failed to start recording");
      cleanup();
    }
  }, [cleanup]);

  const handlePause = useCallback(() => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.pause();
      setIsPaused(true);
    }
  }, []);

  const handleResume = useCallback(() => {
    if (mediaRecorder.current?.state === "paused") {
      mediaRecorder.current.resume();
      setIsPaused(false);
    }
  }, []);

  const handleStop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    isRecording,
    duration,
    isPaused,
    recordings,
    error,
    startRecording,
    handlePause,
    handleResume,
    handleStop,
    formatTime,
  };
}