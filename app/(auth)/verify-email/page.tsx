"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const VerifyEmailPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const addUserToDatabase = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(userError?.message || "User not found.");
        setLoading(false);
        return;
      }

      try {
        // Use upsert instead of insert to handle existing users
        const { error: upsertError } = await supabase
          .from("users")
          .upsert(
            {
              id: user.id,
              email: user.email,
              notion_connected: false,
              notion_access_token: null,
              notion_workspace_id: null,
              notion_bot_id: null,
              google_docs_connected: false,
              google_access_token: null,
              google_refresh_token: null,
              calendar_connected: false,
              calendar_access_token: null,
              calendar_refresh_token: null,
              memory_enabled: true,
            },
            {
              // If the record already exists, do not update existing fields
              onConflict: 'id',
            }
          );

        if (upsertError) {
          throw upsertError;
        }

        setLoading(false);
        // router.push("/dashboard");
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    addUserToDatabase();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <Loader2 
            className="mx-auto mb-4 animate-spin text-blue-600" 
            size={64} 
          />
          <p className="text-xl text-gray-700 font-semibold">
            Verifying your email and setting up your account...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
          <div className="mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Verification Error
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push("/")}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300 ease-in-out"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
        <div className="mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Email Verified!
        </h2>
        <p className="text-gray-600 mb-6">
          Your email has been verified and your account has been successfully set up.
        </p>
        <button 
          onClick={() => router.push("/")}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;