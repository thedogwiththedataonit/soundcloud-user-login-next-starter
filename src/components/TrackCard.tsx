'use client';

import React from 'react';
import Image from 'next/image';
import { SoundCloudTrack } from '@/lib/soundcloud-types';
import { SoundCloudAuth } from '@/lib/soundcloud';

interface TrackCardProps {
  track: SoundCloudTrack;
}

const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const defaultArtwork = '/music-placeholder.svg';
  const artworkUrl = track.artwork_url ? track.artwork_url.replace('large', 't300x300') : defaultArtwork;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="flex">
        {/* Artwork */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={artworkUrl}
            alt={track.title}
            width={96}
            height={96}
            className="w-full h-full object-cover"
            unoptimized={artworkUrl === defaultArtwork}
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center group">
            <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-orange-500 rounded-full p-2 text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {/* Track Title */}
              <h3 className="font-semibold text-gray-900 truncate text-sm mb-1">
                <a 
                  href={track.permalink_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-orange-600 transition-colors"
                >
                  {track.title}
                </a>
              </h3>

              {/* Artist */}
              <p className="text-gray-600 text-sm mb-2 truncate">
                <a 
                  href={track.user.permalink_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-orange-600 transition-colors"
                >
                  {track.user.full_name || track.user.username}
                </a>
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.048-.2-2.05-.571-2.971a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {SoundCloudAuth.formatNumber(track.playback_count)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  {SoundCloudAuth.formatNumber(track.likes_count)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  {SoundCloudAuth.formatNumber(track.comment_count)}
                </span>
              </div>
            </div>

            {/* Duration */}
            <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {SoundCloudAuth.formatDuration(track.duration)}
            </div>
          </div>

          {/* Genre and Creation Date */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            {track.genre && (
              <span className="bg-gray-100 px-2 py-1 rounded">
                {track.genre}
              </span>
            )}
            <span>
              {SoundCloudAuth.getTimeAgo(track.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Description (if exists and short) */}
      {track.description && track.description.length < 100 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-600 line-clamp-2">
            {track.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackCard; 