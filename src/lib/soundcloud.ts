import { generateCodeVerifier, generateCodeChallenge, generateState } from './pkce';
import { TokenStore } from './upstash';
import { 
  SoundCloudUser, 
  SoundCloudTracksResponse,
  SoundCloudUserLegacy 
} from './soundcloud-types';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

export class SoundCloudAuth {
  private static readonly baseUrl = 'https://secure.soundcloud.com';
  private static readonly apiUrl = 'https://api.soundcloud.com';
  private static readonly clientId = process.env.SOUNDCLOUD_CLIENT_ID!;
  private static readonly clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET!;
  private static readonly redirectUri = process.env.SOUNDCLOUD_REDIRECT_URI!;

  // Generate OAuth URL for user authorization
  static async generateAuthUrl(sessionId: string): Promise<string> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store PKCE data in Upstash
    await TokenStore.storePKCEData(state, {
      code_verifier: codeVerifier,
      user_session_id: sessionId,
    });

    const authUrl = new URL(`${this.baseUrl}/authorize`);
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);

    return authUrl.toString();
  }

  // Exchange authorization code for access token
  static async exchangeCodeForToken(code: string, state: string): Promise<{ tokens: TokenResponse; sessionId: string }> {
    const pkceData = await TokenStore.getPKCEData(state);
    
    if (!pkceData) {
      throw new Error('Invalid or expired state parameter');
    }

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code_verifier: pkceData.code_verifier,
        code: code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const tokens = await response.json() as TokenResponse;
    
    return {
      tokens,
      sessionId: pkceData.user_session_id,
    };
  }

  // Get comprehensive user profile data
  static async getUserProfile(accessToken: string): Promise<SoundCloudUser> {
    const response = await fetch(`${this.apiUrl}/me`, {
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch user profile: ${error}`);
    }

    return response.json();
  }

  // Get user's liked tracks
  static async getUserLikedTracks(accessToken: string, limit: number = 20, offset: number = 0): Promise<SoundCloudTracksResponse> {
    const url = new URL(`${this.apiUrl}/me/likes/tracks`);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());
    url.searchParams.append('linked_partitioning', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch liked tracks: ${error}`);
    }

    return response.json();
  }

  // Utility method to format duration
  static formatDuration(milliseconds: number | null | undefined): string {
    if (milliseconds == null || milliseconds === undefined) {
      return '0:00';
    }
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Utility method to format numbers
  static formatNumber(num: number | null | undefined): string {
    if (num == null || num === undefined) {
      return '0';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Utility method to get time ago
  static getTimeAgo(dateString: string | null | undefined): string {
    if (!dateString) {
      return 'unknown';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'unknown';
    }
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return response.json();
  }

  // Get valid access token (refresh if needed)
  static async getValidAccessToken(userId: string): Promise<string | null> {
    const tokens = await TokenStore.getUserTokens(userId);
    
    if (!tokens) {
      return null;
    }

    // Check if token is expired
    if (Date.now() >= tokens.expires_at) {
      try {
        const newTokens = await this.refreshToken(tokens.refresh_token);
        
        // Store refreshed tokens
        await TokenStore.storeUserTokens(userId, {
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: Date.now() + (newTokens.expires_in * 1000),
        });
        
        return newTokens.access_token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      }
    }

    return tokens.access_token;
  }
}

// Export the legacy type for backward compatibility
export type { SoundCloudUserLegacy as SoundCloudUser }; 