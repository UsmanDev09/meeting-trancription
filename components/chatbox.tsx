"use client";

import * as React from "react";
import { Bot, CircleArrowUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ChatInterface() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [messages, setMessages] = React.useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 left-4 right-60 z-50 mx-auto max-w-2xl">
      <Card
        className={cn(
          "transition-all duration-300 relative",
          isExpanded ? "h-96" : "h-16"
        )}
      >
        <CardContent className="h-full p-0">
          {isExpanded && (
            <>
              <div className="absolute right-2 top-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close chat</span>
                </Button>
              </div>
              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask anything about your conversations..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <CircleArrowUp className="h-7 w-7" />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="flex h-full w-full items-center gap-2 px-4 text-sm text-muted-foreground hover:text-foreground"
            >
              <Bot className="h-4 w-4" />
              Ask anything about your conversations...
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
