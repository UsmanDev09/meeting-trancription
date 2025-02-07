import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play } from "lucide-react";
import Image from "next/image";

export function MyConversationsTab() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Play className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">My Conversation #{i + 1}</h3>
                <p className="text-sm text-muted-foreground">
                  {30 - i} minutes • Today
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/placeholder.svg"
              alt="Conversation preview"
              width={300}
              height={169}
              className="rounded-lg w-full"
            />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Key point discussed during the conversation
              </p>
              <p className="text-sm text-muted-foreground">
                • Another important highlight from the meeting
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
