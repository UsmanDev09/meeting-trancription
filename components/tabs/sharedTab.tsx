import { Button } from "@/components/ui/button";
import { Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SharedTab() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Shared Document #{i + 1}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Shared by</span>
                  <Avatar className="h-5 w-5">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <span>User {i + 1}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
