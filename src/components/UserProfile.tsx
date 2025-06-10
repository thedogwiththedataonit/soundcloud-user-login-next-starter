'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SoundCloudUser } from '@/lib/soundcloud';

interface UserProfileProps {
  onLogout: () => void;
  user?: SoundCloudUser | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout, user: propUser }) => {
  const [user, setUser] = useState<SoundCloudUser | null>(propUser || null);
  const [loading, setLoading] = useState(!propUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is provided as prop, don't fetch
    if (propUser) {
      setUser(propUser);
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError('Failed to load user profile');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [propUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5500]"></div>
        <span className="ml-2">Loading user profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-6">
        {user.avatar_url && (
          <Image 
            src={user.avatar_url} 
            alt={user.username}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {user.full_name || user.username}
          </h2>
          <p className="text-gray-600">@{user.username}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Followers</p>
          <p className="text-lg font-semibold">
            {user.followers_count?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Following</p>
          <p className="text-lg font-semibold">
            {user.followings_count?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Tracks</p>
          <p className="text-lg font-semibold">
            {user.track_count?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Playlists</p>
          <p className="text-lg font-semibold">
            {user.playlist_count?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {user.description && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Bio</p>
          <p className="text-gray-800 italic">{user.description}</p>
        </div>
      )}

      {user.city && user.country && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">Location</p>
          <p className="text-gray-800">{user.city}, {user.country}</p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile; 