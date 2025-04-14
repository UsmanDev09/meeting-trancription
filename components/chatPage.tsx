"use client";

import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "This channel is just between me and you. Ask anything about your conversations.",
    },
    {
      role: "assistant",
      content:
        'Stuck searching for answers? Otter Chat has you covered.\n\nWith Otter Chat, you can easily access crucial details from all your discussions, without the hassle of sifting through endless conversation threads. Just ask questions like:\n\n• "What was decided about pricing in last week\'s leadership meeting?"\n• "When is our product launch date?"\n• "What were Q4 revenue totals from the earnings call?"\n\nOtter Chat, our new AI-powered feature, generates answers from your discussions, meeting notes, and task lists making your workspace more efficient, collaborative, and informed.',
    },
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <div className="border-b">
          <div className="flex items-center gap-2 p-4">
            <Bot className="w-6 h-6" />
            <div>
              <h1 className="font-semibold">Bot</h1>
              <p className="text-sm text-muted-foreground">AI Chat</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
              >
                <CardContent className="p-3 whitespace-pre-wrap">
                  {message.content}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Otter anything about your conversations"
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
            <Button variant="outline" size="icon">
              <Sparkles className="h-4 w-4" />
              <span className="sr-only">Show suggestions</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
