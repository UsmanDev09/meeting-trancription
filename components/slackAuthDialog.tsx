import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setSlackConnected,
  setSlackLoading,
  setSlackError,
  setTeamInfo,
} from "@/redux/slices/slackSlice";
import {
  selectSlackLoading,
  selectSlackError,
  isSlackConnected,
} from "@/redux/utils";

interface SlackAuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SlackAuthDialog({
  isOpen,
  onOpenChange,
}: SlackAuthDialogProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectSlackLoading);
  const error = useAppSelector(selectSlackError);
  const handleSlackAuth = async () => {
    dispatch(setSlackLoading(true));
    dispatch(setSlackError(null));
    
    try {
      const response = await fetch("/api/slack/auth");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Slack authentication');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Redirect to Slack OAuth
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error initiating Slack auth:", error);
      dispatch(setSlackError(error.message || 'Failed to connect to Slack'));
      toast({
        title: "Slack Connection Failed",
        description: error.message || 'Please check your Slack configuration',
        variant: "destructive",
      });
    } finally {
      dispatch(setSlackLoading(false));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect with Slack</DialogTitle>
          <DialogDescription>
            Connect your Slack workspace to share meeting notes and summaries.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col items-center gap-4 py-4">
          <Button
            onClick={handleSlackAuth}
            disabled={isLoading}
            className="w-full flex items-center gap-2"
          >
            <Image
              src="/slack_icon.svg"
              alt="Slack Logo"
              width={20}
              height={20}
            />
            {isLoading ? "Connecting..." : "Connect with Slack"}
          </Button>
          
          {error && error.includes('client_id') && (
            <p className="text-sm text-gray-500">
              The Slack integration has not been properly configured. Please contact your administrator.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 