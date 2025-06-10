'use client';

import React from 'react';
import Image from 'next/image';
import { SoundCloudUser } from '@/lib/soundcloud-types';
import { SoundCloudAuth } from '@/lib/soundcloud';

interface UserProfileDetailedProps {
  user: SoundCloudUser;
  onLogout: () => void;
}

const UserProfileDetailed: React.FC<UserProfileDetailedProps> = ({ user, onLogout }) => {
  const formatUploadQuota = () => {
    if (user.quota.unlimited_upload_quota) {
      return 'Unlimited';
    }
    const totalHours = Math.floor(user.quota.upload_seconds_left / 3600);
    return `${totalHours} hours remaining`;
  };

  const formatJoinDate = () => {
    const date = new Date(user.created_at);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8">
        <div className="flex items-center gap-6">
                  <div className="relative">
          {user.avatar_url ? (
            <Image 
              src={user.avatar_url} 
              alt={user.username}
              width={120}
              height={120}
              className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-30 h-30 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {user.online && (
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">
              {user.full_name || user.username}
            </h1>
            <p className="text-orange-100 text-lg mb-1">@{user.username}</p>
            {user.city && user.country && (
              <p className="text-orange-100 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {user.city}, {user.country}
              </p>
            )}
            <p className="text-orange-100 text-sm mt-2">
              Member since {formatJoinDate()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900">
              {SoundCloudAuth.formatNumber(user.followers_count)}
            </p>
            <p className="text-sm text-gray-600">Followers</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900">
              {SoundCloudAuth.formatNumber(user.followings_count)}
            </p>
            <p className="text-sm text-gray-600">Following</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900">
              {SoundCloudAuth.formatNumber(user.track_count)}
            </p>
            <p className="text-sm text-gray-600">Tracks</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900">
              {SoundCloudAuth.formatNumber(user.likes_count)}
            </p>
            <p className="text-sm text-gray-600">Likes</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Content</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">{user.playlist_count}</span> Playlists</p>
              <p><span className="font-medium">{user.reposts_count}</span> Reposts</p>
              <p><span className="font-medium">{user.public_favorites_count}</span> Public Favorites</p>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Account</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Plan:</span> {user.plan}</p>
              <p><span className="font-medium">Upload Quota:</span> {formatUploadQuota()}</p>
              <p className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${user.primary_email_confirmed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Email {user.primary_email_confirmed ? 'Verified' : 'Unverified'}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Privacy</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">{user.private_tracks_count}</span> Private Tracks</p>
              <p><span className="font-medium">{user.private_playlists_count}</span> Private Playlists</p>
              <p><span className="font-medium">Locale:</span> {user.locale}</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {user.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{user.description}</p>
            </div>
          </div>
        )}

        {/* Website Link */}
        {user.website && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Website</h3>
            <a 
              href={user.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              {user.website_title || user.website}
            </a>
          </div>
        )}

        {/* Subscriptions */}
        {user.subscriptions && user.subscriptions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Subscriptions</h3>
            <div className="space-y-2">
              {user.subscriptions.map((subscription, index) => (
                <div key={index} className="bg-yellow-50 p-3 rounded-lg flex items-center justify-between">
                  <span className="font-medium">{subscription.product.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    subscription.recurring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.recurring ? 'Recurring' : 'One-time'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <a
            href={user.permalink_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            View on SoundCloud
          </a>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetailed; 