'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SoundCloudSignIn from '@/components/SoundCloudSignIn';
import UserProfile from '@/components/UserProfile';

function HomeContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/user/profile');
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Check for error parameters from OAuth flow
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'oauth_error':
          setError('Authentication was cancelled or failed');
          break;
        case 'missing_params':
          setError('Missing required parameters');
          break;
        case 'callback_error':
          setError('Authentication callback failed');
          break;
        default:
          setError('Authentication error occurred');
      }
    }

    checkAuthStatus();
  }, [searchParams]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5500] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SoundCloud Integration Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect your SoundCloud account to get started
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-md mx-auto">
            {error}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="mb-6">
                <svg 
                  className="w-16 h-16 mx-auto mb-4 text-[#ff5500]" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm2 0h1v-8.448l-.621-.857c-.178-.309-.392-.592-.621-.857l.242.857v9.305zm3-2.506c-.146-.434-.321-.852-.527-1.241l-.473 1.241v2.506h1v-2.506zm2-1.441c-.508-.479-1.103-.85-1.766-1.103l-.234.103c.663.253 1.258.624 1.766 1.103l.234-.103zm1-2.439c-.508-.479-1.103-.85-1.766-1.103l-.234.103c.663.253 1.258.624 1.766 1.103l.234-.103z"/>
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to Connect?
                </h2>
                <p className="text-gray-600 mb-6">
                  Sign in with your SoundCloud account to access your profile and make authenticated API requests.
                </p>
              </div>
              
              <SoundCloudSignIn />
              
              <p className="text-sm text-gray-500 mt-4">
                Your SoundCloud credentials are secure and we only access basic profile information.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <UserProfile onLogout={handleLogout} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5500] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
