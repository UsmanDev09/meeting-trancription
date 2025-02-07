import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";

export function TrashTab() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4 opacity-75">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium">Deleted Item #{i + 1}</h3>
                <p className="text-sm text-muted-foreground">
                  Deleted {i + 1} days ago
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </div>
        </div>
      ))}
      <div className="text-center text-sm text-muted-foreground">
        Items in trash will be automatically deleted after 30 days
      </div>
    </div>
  );
}
