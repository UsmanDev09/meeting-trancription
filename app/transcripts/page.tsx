"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import createClient from "@/lib/supabase";
import { toast } from "react-toastify";
import { Sidebar } from "@/components/sidebar";

interface Transcript {
  id: string;
  meeting_id: string;
  url: string;
  transcript: string;
  status: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
}

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        setIsLoading(true);
        const supabase = await createClient();
        
        // Get all transcripts for the user
        const { data, error } = await supabase
          .from('meeting_transcripts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setTranscripts(data || []);
      } catch (error) {
        console.error('Error fetching transcripts:', error);
        toast('Failed to load transcripts', { type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTranscripts();
  }, []);

  const handleDownload = async (transcript: Transcript) => {
    try {
      // Create a blob with the transcript text
      const blob = new Blob([transcript.transcript || ''], { type: 'text/plain' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${transcript.meeting_id}-${format(new Date(transcript.created_at), 'yyyy-MM-dd')}.txt`;
      
      // Append the link to the document
      document.body.appendChild(a);
      
      // Trigger the download
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast('Transcript downloaded', { type: 'success' });
    } catch (error) {
      console.error('Error downloading transcript:', error);
      toast('Failed to download transcript', { type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('meeting_transcripts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update the UI
      setTranscripts(transcripts.filter(t => t.id !== id));
      
      toast('Transcript deleted', { type: 'success' });
    } catch (error) {
      console.error('Error deleting transcript:', error);
      toast('Failed to delete transcript', { type: 'error' });
    }
  };

  // Filter transcripts based on active tab
  const filteredTranscripts = transcripts.filter(transcript => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in-progress') return transcript.status === 'in_progress';
    if (activeTab === 'completed') return transcript.status === 'completed';
    return true;
  });

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="py-4 flex items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Meeting Transcripts</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading transcripts...</p>
                </div>
              ) : filteredTranscripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-gray-500 mb-2">No transcripts found</p>
                  <p className="text-sm text-gray-400">
                    Start a meeting bot to create transcripts
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTranscripts.map((transcript) => (
                    <div
                      key={transcript.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            Meeting ID: {transcript.meeting_id}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>
                              {format(
                                new Date(transcript.created_at),
                                "MMM d, yyyy h:mm a"
                              )}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transcript.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : transcript.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : transcript.status === "error"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {transcript.status === "in_progress"
                                ? "In Progress"
                                : transcript.status === "completed"
                                ? "Completed"
                                : transcript.status === "error"
                                ? "Error"
                                : transcript.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(transcript)}
                            disabled={!transcript.transcript}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(transcript.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {transcript.status === "error" && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {transcript.error_message || "Unknown error"}
                        </div>
                      )}
                      {transcript.transcript && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Preview:</h4>
                          <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                            {transcript.transcript.split("\n").slice(0, 5).map((line, i) => (
                              <p key={i} className="mb-1">
                                {line}
                              </p>
                            ))}
                            {transcript.transcript.split("\n").length > 5 && (
                              <p className="text-gray-400 italic">
                                ... more content available
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
} 