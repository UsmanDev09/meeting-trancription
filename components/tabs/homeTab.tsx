import { Calendar } from "lucide-react"
import Link from "next/link";

export function HomeTab() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mt-6 w-[90%]">
        <h3 className="text-lg text-gray-600">Yesterday, Jan 2</h3>
        <div className="mt-4 bg-white rounded-lg border p-4">
          <Link href={"/note"}>
            <div className="flex items-center justify-between gap-4 cursor-pointer">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  Learn how to use Otter
                </h4>
                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                  <span>3:26 PM</span>
                  <span>•</span>
                  <span>3 min</span>
                  <span>•</span>
                  <span>Ghost</span>
                  <span>•</span>
                  <span>General</span>
                </div>
                <div className="flex items-center text-sm text-gray-700 mt-3">
                  <span className="mr-3">•</span>
                  <span>
                    Using AI-powered Otter for meeting notes and organiz...
                  </span>
                </div>
              </div>
              <div className="h-24 w-32 rounded-lg overflow-hidden flex-shrink-0">
                <Calendar />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
