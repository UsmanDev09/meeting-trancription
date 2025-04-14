"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Link2,
  Pause,
  Square,
  Play,
  CalendarIcon,
  Clock,
  Lock,
  Camera,
  Copy,
  Pencil,
  Share2,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MediaLibraryDialog } from "@/components/mediaLibraryDialog";
import Image from "next/image";
import { Checkbox } from "@radix-ui/react-checkbox";
import React from "react";
import { NavigationDock } from "@/components/navigationDock";
import { SlackDialog } from "@/components/slackDialog";
import supabase from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  date: Date;
}

interface Message {
  id: string;
  speaker: string;
  initial: string;
  time: string;
  text: string;
}

interface Channel {
  id: string;
  name: string;
}

export default function NotePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioStream = useRef<MediaStream | null>(null);
  const [isSlackOpen, setIsSlackOpen] = useState(false);
  const [currentMeetingId, setCurrentMeetingId] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const chunks = useRef<BlobPart[]>([]);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [recordings, setRecordings] = useState<MediaFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      speaker: "Charlie",
      initial: "C",
      time: "0:00",
      text: "Hey Lisa, I got your email with a meeting summary from Otter and I was curious about how it works. Have you been using it a lot for your meetings?",
    },
    {
      id: "2",
      speaker: "Lisa",
      initial: "L",
      time: "0:08",
      text: "Yeah, I started using Otter a few months ago. And it saved me a lot of time from...",
    },
  ]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
    setCurrentMeetingId(`meeting_${Date.now()}`);
  }, []);

  useEffect(() => {
    if (searchParams.get("record") === "audio" && !isRecording) {
      startRecording();
    }
  }, [searchParams, isRecording]);

  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop();
      }
      if (audioStream.current) {
        audioStream.current.getTracks().forEach((track) => track.stop());
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
      audioStream.current = stream; // Store the stream so we can stop it later.
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
          url,
          date: new Date(),
          type: "audio",
        };
        setRecordings((prev) => [...prev, newRecording]);
        chunks.current = [];
      };

      // Add event listeners (for debugging)
      mediaRecorder.current.onpause = () => {
        console.log("Recording paused");
      };

      mediaRecorder.current.onresume = () => {
        console.log("Recording resumed");
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setDuration(0);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  // Pause recording
  const handlePause = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.pause();
      setIsPaused(true);
    }
  };

  // Resume recording
  const handleResume = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "paused") {
      mediaRecorder.current.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    if (audioStream.current) {
      audioStream.current.getTracks().forEach((track) => track.stop());
      audioStream.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
    router.replace("/note");
    setIsMediaLibraryOpen(true);
    saveTranscript(currentMeetingId);
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

  const suggestions = [
    "How can we ensure everyone is heard and engaged in this meeting?",
    "What are the key topics we need to cover in this meeting?",
    "What actions should we take to follow up on this discussion?",
  ];

  const actionItems = [
    "Assign this action item to yourself",
    "Check off this action item",
    "Try Otter Chat",
    "Copy the summary",
    "Try tagging a speaker",
    "Choose which meetings you want Otter to join and take notes",
  ];

  // Save transcript to the database
const saveTranscript = async (meetingId: string) => {
  if (!userId) {
    toast({
      title: "Authentication required",
      description: "Please sign in to save transcripts",
      variant: "destructive",
    });
    return;
  }
  try {
    setIsSaving(true);
    const transcriptText = messages
      .map((message) => `${message.speaker} (${message.time}): ${message.text}`)
      .join("\n");
    const contextFiles =
    recordings.length > 0 ? recordings.map((recording) => recording.url) : [];
    const suggestions = actionItems;
    const embeddings = null; 
    const payload = {
      user_id: userId,
      meeting_id: meetingId,
      transcript: transcriptText,
      context_files: contextFiles,
      embeddings: embeddings,
      generated_prompt: suggestions.join(", "),
      chunks: 'lkajdsflksajfd',
      suggestion_count: suggestions.length,
    };

    const response = await fetch("/api/transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to save transcript");
    }

    const result = await response.json();
    console.log("Transcript saved successfully:", result);
    toast({
      title: "Transcript saved",
      description: "Your meeting transcript has been saved successfully",
    });
    return result;
  } catch (error) {
    console.error("Error saving transcript:", error);
    toast({
      title: "Error saving transcript",
      description: "Please try again later",
      variant: "destructive",
    });
    throw error;
  } finally {
    setIsSaving(false);
  }
};

  // Manual transcript save handler
  const handleSaveTranscript = async () => {
    await saveTranscript(currentMeetingId);
  };

  // Get Slack channels and toggle Slack dialog
  const handleSlackClick = async () => {
    try {
      const response = await fetch("/api/slack/channels", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to get Slack channels");
      }
      const data = await response.json();
      const channelList: Channel[] = data.channels.map((channel: any) => ({
        id: channel.id,
        name: channel.name,
      }));
      setChannels(channelList);
    } catch (error) {
      console.error("Error:", error);
      console.log("Failed to get Slack channels. Please try again.");
    }
    setIsSlackOpen(!isSlackOpen);
  };

  // Post transcript and summary to Slack
  const postToSlack = async (selectedChannels: any) => {
    try {
      const transcriptText = messages
        .map(
          (message) => `${message.speaker} (${message.time}): ${message.text}`
        )
        .join("\n");
      const summaryText =
        "Charlie and Lisa discuss Otter AI, a meeting note-taking tool that transcribes and summarizes meetings in real-time. " +
        "Lisa explains how Otter works by joining meetings on her calendar and providing live notes, automatic screenshots, and action items. " +
        "Charlie is interested in using Otter for his own meetings and asks questions about how to set it up and share notes with his team.\n\n" +
        "Action Items: " +
        actionItems.join(", ");
      const payload = {
        transcript: transcriptText,
        summary: summaryText,
        selectedChannels,
      };
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to post to Slack");
      }
      console.log("Message posted to Slack successfully!");
      toast({
        title: "Posted to Slack",
        description: "Your meeting details have been shared to Slack",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Failed to post to Slack",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

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
              variant="ghost"
              size="sm"
              className="gap-2 text-black"
              onClick={handleSaveTranscript}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Transcript"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-black"
              onClick={handleSlackClick}
            >
              <Image
                src={"/slack_icon.svg"}
                alt="Slack Logo"
                width={20}
                height={20}
              />
              Post to Slack
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-purple-600 text-white"
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
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold">
                    Learn how to use Otter
                  </h1>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>MT</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>Ghost</span>
                    <CalendarIcon className="h-4 w-4" />
                    <span>Today at 3:45 pm</span>
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(duration)}</span>
                    <Camera className="h-4 w-4" />
                    <span>6 Screenshots</span>
                    <Copy className="h-4 w-4" />
                    <span>Copy Summary</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                  <span>Shared with: General</span>
                </div>

                <Tabs defaultValue="summary" className="mt-8">
                  <div className="sticky top-0 z-10 border-b">
                    <TabsList className="w-full justify-start py-0 h-auto bg-white">
                      <TabsTrigger
                        value="summary"
                        className="rounded-none border-b-2 py-2 text-md border-transparent data-[state=active]:border-b-purple-600 data-[state=active]:bg-transparent"
                      >
                        Summary
                      </TabsTrigger>
                      <TabsTrigger
                        value="transcript"
                        className="rounded-none border-b-2 py-2 text-md border-transparent data-[state=active]:border-b-purple-600 data-[state=active]:bg-transparent"
                      >
                        Transcript
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="summary" className="mt-6">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Overview</h2>
                        <p className="text-muted-foreground">
                          Charlie and Lisa discuss Otter AI, a meeting
                          note-taking tool that transcribes and summarizes
                          meetings in real-time. Lisa explains how Otter works
                          by joining meetings on her calendar and providing live
                          notes, automatic screenshots, and action items.
                          Charlie is interested in using Otter for his own
                          meetings and asks questions about how to set it up and
                          share notes with his team.
                        </p>
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold mb-4">
                          Action Items
                        </h2>
                        <div className="space-y-3">
                          {actionItems.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox id={`action-${i}`} />
                              <label htmlFor={`action-${i}`}>{item}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="transcript" className="mt-6">
                    <div className="space-y-6">
                      <div className="text-lg font-semibold mb-4">Speakers</div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Lisa (79%), Charlie (21%)
                        </div>
                      </div>

                      <div className="space-y-6 mb-20">
                        {messages.map((message) => (
                          <div key={message.id} className="flex gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {message.initial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {message.speaker}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {message.time}
                                </span>
                              </div>
                              <p className="mt-1">{message.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Audio Recording Controls (only visible when recording is active) */}
            {isRecording && (
              <div className="border-t p-4 flex items-center gap-4">
                {!isPaused ? (
                  <Button variant="ghost" onClick={handlePause}>
                    <Pause className="h-4 w-4" />
                    Pause Recording
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={handleResume}>
                    <Play className="h-4 w-4" />
                    Resume Recording
                  </Button>
                )}
                <Button variant="ghost" onClick={handleStop}>
                  <Square className="h-4 w-4" />
                  Stop Recording
                </Button>
              </div>
            )}

            {/* Navigation Dock */}
            <div className="border-t">
              <NavigationDock />
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-[38%] border-l h-full">
            <Tabs
              defaultValue="ai-chat"
              className="w-full h-full flex flex-col"
            >
              <TabsList className="flex gap-1 justify-start border-b rounded-none p-4 bg-white sticky top-0 z-10">
                <TabsTrigger
                  value="ai-chat"
                  className="w-full justify-start rounded-md data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  AI Chat
                </TabsTrigger>
                <TabsTrigger
                  value="outline"
                  className="w-full justify-start rounded-md data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  Outline
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="w-full justify-start rounded-md data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="ai-chat"
                className="flex-1 overflow-y-auto relative px-4"
              >
                <div className="space-y-4 pb-20">
                  <div className="flex flex-col justify-center items-center gap-4">
                    <h2 className="text-xl font-semibold text-center mt-10">
                      Ask AI questions or
                    </h2>
                    <h2 className="text-xl font-semibold text-center">
                      chat with your teammates
                    </h2>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border w-80 hover:cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">✨</span>
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
                      className="w-full px-4 py-2 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600">
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
        </main>
      </div>

      <SlackDialog
        postToSlack={postToSlack}
        channels={channels}
        isOpen={isSlackOpen}
        onOpenChange={setIsSlackOpen}
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
    </div>
  );
}
