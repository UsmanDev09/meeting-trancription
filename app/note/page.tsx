"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Link2,
  Mic,
  Pause,
  Square,
  Play,
  CalendarIcon,
  Clock,
  IdCard,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MediaLibraryDialog } from "@/components/mediaLibraryDialog";

interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  date: Date;
}

export default function NotePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const router = useRouter();
  const chunks = useRef<BlobPart[]>([]);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const [recordings, setRecordings] = useState<MediaFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

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
          url: url,
          date: new Date(),
          type: "audio",
        };

        setRecordings((prev) => [...prev, newRecording]);
        chunks.current = [];
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setDuration(0);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const handlePause = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "paused") {
      mediaRecorder.current.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setIsMediaLibraryOpen(true);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const deleteFile = (id: string, isRecording: boolean) => {
    if (isRecording) {
      setRecordings((prev) => prev.filter((rec) => rec.id !== id));
    } else {
      setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    }
  };

  const messages = [
    { id: 1, time: "0:07", text: "Hello." },
    { id: 2, time: "0:10", text: "Hello." },
    { id: 3, time: "0:15", text: "Hello." },
  ];

  const suggestions = [
    "How can we ensure everyone is heard and engaged in this meeting?",
    "What are the key topics we need to cover in this meeting?",
    "What actions should we take to follow up on this discussion?",
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="py-4 flex items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Note</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-purple-500 text-white"
            >
              <Lock className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="px-2">
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4">
              {/* Title Section */}
              <div className="py-4">
                <h1 className="text-xl font-semibold">Note Title</h1>
              </div>

              {/* Info Bar */}
              <div className="py-4 flex items-center gap-2 text-sm text-gray-500 border-b">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(new Date(), "EEE, MMM d, yyyy . h:mm a")}</span>
                <Clock className="h-4 w-4" />
                <span>{formatTime(duration)}</span>
                <IdCard className="h-4 w-4" />
                <span>Owner: Ghost</span>
              </div>

              {/* Messages */}
              <div className="mt-5 space-y-4 mb-20">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                      G
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">
                        {message.time}
                      </div>
                      <div className="mt-1">{message.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-[38%] border-l">
            <Tabs
              defaultValue="ai-chat"
              className="w-full h-full flex flex-col"
            >
              <TabsList className="flex gap-1 justify-start border-b rounded-none p-4 bg-white sticky top-0 z-10">
                <TabsTrigger
                  value="ai-chat"
                  className="w-full justify-start rounded-md data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                >
                  AI Chat
                </TabsTrigger>
                <TabsTrigger
                  value="outline"
                  className="w-full justify-start rounded-md data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                >
                  Outline
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="w-full justify-start rounded-md data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                >
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="ai-chat"
                className="flex-1 overflow-y-auto relative px-4"
              >
                <div className="space-y-4 pb-20">
                  <div className="flex flex-col justify-center items-center gap-4 ">
                    <h2 className="text-xl font-semibold text-center mt-10">
                      Ask AI questions or
                    </h2>
                    <h2 className="text-xl font-semibold text-center">
                       chat with your teammates
                    </h2>
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="p-4 rounded-lg border w-80 hover:cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-500">✨</span>
                          <span>{suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ask Otter anything about your conversations..."
                      className="w-full px-4 py-2 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500">
                      ✨
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="outline"
                className="flex-1 overflow-y-auto p-4"
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Document Outline</h2>
                  {/* Add outline content here */}
                </div>
              </TabsContent>

              <TabsContent
                value="comments"
                className="flex-1 overflow-y-auto p-4"
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Comments</h2>
                  {/* Add comments content here */}
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        </div>

        {/* Recording Controls */}
        <footer className="border-t bg-white">
          {!isRecording ? (
            <div className="py-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={startRecording}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Record
                </Button>
                {(recordings.length > 0 || uploadedFiles.length > 0) && (
                  <Button
                    variant="outline"
                    onClick={() => setIsMediaLibraryOpen(true)}
                    className="rounded-xl"
                  >
                    Library
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Mic className="h-5 w-5 text-red-600" />
                  <div className="h-1 bg-gray-100 rounded-full flex-1">
                    <div
                      className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${(duration / 180) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 min-w-[48px]">
                    {formatTime(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isPaused ? handleResume : handlePause}
                  >
                    {isPaused ? (
                      <Play className="h-5 w-5" />
                    ) : (
                      <Pause className="h-5 w-5" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleStop}>
                    <Square className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </footer>
      </div>

      <MediaLibraryDialog
        isOpen={isMediaLibraryOpen}
        onOpenChange={setIsMediaLibraryOpen}
        mediaType={mediaType}
        onMediaTypeChange={(value: "audio" | "video") => setMediaType(value)}
        recordings={recordings}
        uploadedFiles={uploadedFiles}
        onDelete={deleteFile}
      />
    </div>
  );
}
