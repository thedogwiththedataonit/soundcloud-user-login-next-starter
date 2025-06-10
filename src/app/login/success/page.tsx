'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UserProfileDetailed from '@/components/UserProfileDetailed';
import LikedTracks from '@/components/LikedTracks';
import { SoundCloudUser } from '@/lib/soundcloud-types';

function LoginSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<SoundCloudUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'tracks'>('profile');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Check for OAuth callback parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Authentication was cancelled or failed');
          setLoading(false);
          return;
        }

        if (code && state) {
          // Exchange code for tokens
          const response = await fetch('/api/auth/exchange-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, state }),
          });

          if (!response.ok) {
            throw new Error('Failed to exchange code for token');
          }

          const data = await response.json();
          
          if (data.success && data.user) {
            setUser(data.user);
            
            // Clean up URL parameters
            const newUrl = new URL(window.location.href);
            newUrl.search = '';
            window.history.replaceState({}, document.title, newUrl.toString());
          } else {
            throw new Error('Authentication failed');
          }
        } else {
          // No OAuth callback parameters, check if user is already authenticated
          const profileResponse = await fetch('/api/user/profile');
          if (profileResponse.ok) {
            const userData = await profileResponse.json();
            setUser(userData);
          } else {
            // Not authenticated, redirect to home
            router.push('/');
            return;
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to complete authentication');
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  const handleLogout = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5500] mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-[#ff5500] hover:bg-[#e64a00] text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SoundCloud!
          </h1>
          <p className="text-gray-600">
            You have successfully authenticated with your SoundCloud account.
          </p>
        </div>

        {user && (
          <>
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg shadow-lg p-1 inline-flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('tracks')}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'tracks'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Liked Tracks
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300">
              {activeTab === 'profile' ? (
                <UserProfileDetailed user={user} onLogout={handleLogout} />
              ) : (
                <LikedTracks />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5500] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginSuccessContent />
    </Suspense>
  );
} 