// SoundCloud API Response Types

export interface SoundCloudQuota {
  unlimited_upload_quota: boolean;
  upload_seconds_used: number;
  upload_seconds_left: number;
}

export interface SoundCloudProduct {
  id: string;
  name: string;
}

export interface SoundCloudSubscription {
  product: SoundCloudProduct;
  recurring: boolean;
}

export interface SoundCloudUser {
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  description: string | null;
  discogs_name: string | null;
  first_name: string | null;
  followers_count: number;
  followings_count: number;
  full_name: string | null;
  urn: string;
  kind: string;
  last_modified: string;
  last_name: string | null;
  likes_count: number;
  locale: string;
  online: boolean;
  permalink: string;
  permalink_url: string;
  plan: string;
  playlist_count: number;
  primary_email_confirmed: boolean;
  private_playlists_count: number;
  private_tracks_count: number;
  public_favorites_count: number;
  quota: SoundCloudQuota;
  reposts_count: number;
  subscriptions: SoundCloudSubscription[];
  track_count: number;
  upload_seconds_left: number;
  uri: string;
  username: string;
  website: string | null;
  website_title: string | null;
  id: number; // Adding ID for consistency
}

export interface SoundCloudTrackUser {
  id: number;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  permalink_url: string;
}

export interface SoundCloudTrack {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  artwork_url: string | null;
  created_at: string;
  genre: string | null;
  permalink_url: string;
  playback_count: number;
  likes_count: number;
  reposts_count: number;
  comment_count: number;
  download_count: number;
  tag_list: string;
  user: SoundCloudTrackUser;
  waveform_url: string | null;
  stream_url?: string;
  download_url?: string;
  purchase_url?: string;
  kind: string;
  uri: string;
  urn: string;
  public: boolean;
  downloadable: boolean;
  streamable: boolean;
}

export interface SoundCloudTracksResponse {
  collection: SoundCloudTrack[];
  next_href: string | null;
}

// Legacy interface for backward compatibility
export interface SoundCloudUserLegacy {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string;
  description: string;
  city: string;
  country: string;
  followers_count: number;
  followings_count: number;
  track_count: number;
  playlist_count: number;
} 