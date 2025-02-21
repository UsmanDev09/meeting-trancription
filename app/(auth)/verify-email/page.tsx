'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const hashParams = window.location.hash.substring(1);
        
        const params = new URLSearchParams(hashParams);
        const tokenHash = params.get('token_hash');
        const typeParam = params.get('type');
        const error = params.get('error');
        const errorCode = params.get('error_code');
        const errorDescription = params.get('error_description');

        if (error || errorCode) {
          console.error('Error in URL parameters:', errorDescription || errorCode || error);
          setErrorMessage(errorDescription || 'Verification link is invalid or has expired');
          setVerificationStatus('error');
          return;
        }

        if (!tokenHash) {
          console.error('No token_hash found in URL hash fragment');
          setErrorMessage('Verification link is missing required parameters');
          setVerificationStatus('error');
          return;
        }

        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email',
        });

        if (verifyError) {
          console.error('Verification error:', verifyError.message);
          setErrorMessage(verifyError.message);
          setVerificationStatus('error');
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError.message);
          setErrorMessage('Failed to retrieve session after verification');
          setVerificationStatus('error');
          return;
        }

        if (session) {
          setVerificationStatus('success');
          setTimeout(() => {
            router.push('/sign-in');
            router.refresh();
          }, 3000);
        } else {
          console.error('No session found after verification');
          setErrorMessage('Verification succeeded but no session was created');
          setVerificationStatus('error');
        }

      } catch (error: any) {
        console.error('Verification process error:', error);
        setErrorMessage(error.message || 'An unexpected error occurred');
        setVerificationStatus('error');
      }
    };

    handleEmailVerification();
  }, [router]);

  const handleLoginRedirect = () => {
    router.push('/sign-in');
    router.refresh();
  };

  const handleRetry = () => {
    router.push('/sign-up');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center p-4">
      <div className="bg-whiteTransparent40 border-gray-80 border-2 border-white rounded-3xl p-8 w-full max-w-md text-center">
        {verificationStatus === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-10 h-10 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Email Verified!</h2>
            <p className="text-gray-600">Your email has been successfully verified. Redirecting you to login...</p>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Verification Failed</h2>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'There was an error verifying your email.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="bg-white text-primary border border-primary px-6 py-2 rounded-md hover:bg-gray-100 transition"
              >
                Try Signing Up Again
              </button>
              <button
                onClick={handleLoginRedirect}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-800 transition"
              >
                Go to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}