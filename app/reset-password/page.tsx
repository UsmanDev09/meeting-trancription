"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import createClient from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const supabase = await createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      setIsSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for the password reset link",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <Image 
            src="/logo.svg" 
            alt="Meeting Transcription Logo" 
            width={48} 
            height={48} 
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        {isSent ? (
          <div className="text-center mt-8 space-y-6">
            <div className="text-lg">
              Password reset email sent!
            </div>
            <p className="text-sm text-gray-600">
              Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-purple-600 text-white"
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="relative block w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center bg-purple-600 py-2 px-4 text-white"
              >
                {isLoading ? "Sending..." : "Send reset instructions"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 