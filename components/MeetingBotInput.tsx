"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Bot, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

export default function MeetingBotInput() {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(60); // Default 60 minutes
  const [showDurationPopover, setShowDurationPopover] = useState(false);

  const handleStartBot = async () => {
    if (!meetingUrl || !meetingUrl.includes("meet.google.com")) {
      toast("Please enter a valid Google Meet URL", { type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/meet-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingUrl,
          duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start meeting bot");
      }

      toast("Bot is joining the meeting and will take notes for you", {
        type: "success",
      });

      // Clear the input
      setMeetingUrl("");
    } catch (error: any) {
      console.error("Error starting bot:", error);
      toast(error.message || "Failed to start meeting bot", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Video className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            placeholder="Paste Google Meet URL"
            className="pl-10 pr-4 py-2 w-full"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Popover open={showDurationPopover} onOpenChange={setShowDurationPopover}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Clock className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4 p-2">
              <h4 className="font-medium">Meeting Duration</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {duration} minutes
                </span>
              </div>
              <Slider
                value={[duration]}
                min={15}
                max={180}
                step={15}
                onValueChange={(value) => setDuration(value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>15m</span>
                <span>60m</span>
                <span>180m</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button 
          onClick={handleStartBot}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Bot className="mr-2 h-4 w-4" />
          {isLoading ? "Starting Bot..." : "Start Bot"}
        </Button>
      </div>
      <div className="text-sm text-gray-500">
        <p>
          The bot will join the meeting, turn on captions, and transcribe the conversation.
          You&apos;ll receive the full transcript after the meeting ends.
        </p>
      </div>
    </div>
  );
} 