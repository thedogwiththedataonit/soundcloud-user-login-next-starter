'use client';

import React, { useState, useEffect } from 'react';
import TrackCard from './TrackCard';
import { SoundCloudTracksResponse } from '@/lib/soundcloud-types';

interface LikedTracksProps {
  className?: string;
}

const LikedTracks: React.FC<LikedTracksProps> = ({ className = '' }) => {
  const [tracksData, setTracksData] = useState<SoundCloudTracksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const fetchTracks = async (newOffset: number = 0, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(`/api/user/liked-tracks?limit=${limit}&offset=${newOffset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch liked tracks');
      }

      const data: SoundCloudTracksResponse = await response.json();
      
      if (append && tracksData) {
        setTracksData({
          collection: [...tracksData.collection, ...data.collection],
          next_href: data.next_href
        });
      } else {
        setTracksData(data);
      }
      
      setOffset(newOffset);
    } catch (err) {
      setError('Failed to load liked tracks');
      console.error('Liked tracks fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    const newOffset = offset + limit;
    fetchTracks(newOffset, true);
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Liked Tracks
          </h2>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex">
                  <div className="w-24 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1 ml-4 py-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Liked Tracks
          </h2>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!tracksData || tracksData.collection.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Liked Tracks
          </h2>
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No liked tracks yet</h3>
            <p className="text-gray-500">Start exploring and liking tracks on SoundCloud!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Liked Tracks
          </h2>
          <span className="text-sm text-gray-500">
            {tracksData.collection.length} track{tracksData.collection.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-4">
          {tracksData.collection.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>

        {/* Load More Button */}
        {tracksData.next_href && (
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Load More Tracks
                </>
              )}
            </button>
          </div>
        )}

        {/* Track Statistics */}
        {tracksData.collection.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
               <div>
                 <p className="text-lg font-semibold text-gray-900">
                   {tracksData.collection.reduce((acc, track) => acc + (track.playback_count || 0), 0).toLocaleString()}
                 </p>
                 <p className="text-sm text-gray-500">Total Plays</p>
               </div>
               <div>
                 <p className="text-lg font-semibold text-gray-900">
                   {tracksData.collection.reduce((acc, track) => acc + (track.likes_count || 0), 0).toLocaleString()}
                 </p>
                 <p className="text-sm text-gray-500">Total Likes</p>
               </div>
               <div>
                 <p className="text-lg font-semibold text-gray-900">
                   {Math.round(tracksData.collection.reduce((acc, track) => acc + (track.duration || 0), 0) / 60000)} min
                 </p>
                 <p className="text-sm text-gray-500">Total Duration</p>
               </div>
               <div>
                 <p className="text-lg font-semibold text-gray-900">
                   {new Set(tracksData.collection.map(track => track.user.id)).size}
                 </p>
                 <p className="text-sm text-gray-500">Unique Artists</p>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedTracks; 