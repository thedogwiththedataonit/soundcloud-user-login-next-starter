# SoundCloud Authentication Implementation Guide

This guide provides a complete implementation for adding "Sign in with SoundCloud" functionality to your web application using the OAuth 2.0 Authorization Code flow with PKCE.

## Prerequisites

- SoundCloud application registered at [SoundCloud Developers](https://soundcloud.com/you/apps)
- Client ID and Client Secret from your SoundCloud app
- Redirect URI configured in your SoundCloud app settings

## Environment Variables

Create a `.env` file in your project root:

```env
SOUNDCLOUD_CLIENT_ID=your_client_id_here
SOUNDCLOUD_CLIENT_SECRET=your_client_secret_here
SOUNDCLOUD_REDIRECT_URI=http://localhost:3000/login/success
```

## Frontend Implementation

### 1. PKCE Helper Functions

Create `utils/pkce.js`:

```javascript
// Generate a random string for code verifier
export function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// Generate code challenge from verifier
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

// Base64 URL encoding
function base64URLEncode(array) {
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Generate random state for CSRF protection
export function generateState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}
```

### 2. SoundCloud Authentication Service

Create `services/soundcloud.js`:

```javascript
import { generateCodeVerifier, generateCodeChallenge, generateState } from '../utils/pkce.js';

class SoundCloudAuth {
  constructor() {
    this.clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    this.redirectUri = process.env.SOUNDCLOUD_REDIRECT_URI;
    this.baseUrl = 'https://secure.soundcloud.com';
    this.apiUrl = 'https://api.soundcloud.com';
  }

  // Initiate OAuth flow
  async initiateAuth() {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store PKCE values in sessionStorage
    sessionStorage.setItem('soundcloud_code_verifier', codeVerifier);
    sessionStorage.setItem('soundcloud_state', state);

    const authUrl = new URL(`${this.baseUrl}/authorize`);
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);

    // Redirect to SoundCloud
    window.location.href = authUrl.toString();
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code, state) {
    const storedState = sessionStorage.getItem('soundcloud_state');
    const codeVerifier = sessionStorage.getItem('soundcloud_code_verifier');

    // Verify state to prevent CSRF attacks
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
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
        client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
        code: code,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await response.json();
    
    // Clean up stored PKCE values
    sessionStorage.removeItem('soundcloud_code_verifier');
    sessionStorage.removeItem('soundcloud_state');

    return tokenData;
  }

  // Get user profile data
  async getUserProfile(accessToken) {
    const response = await fetch(`${this.apiUrl}/me`, {
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return response.json();
  }
}

export default new SoundCloudAuth();
```

### 3. React Components

#### Sign In Button Component

Create `components/SoundCloudSignIn.jsx`:

```jsx
import React from 'react';
import soundCloudAuth from '../services/soundcloud.js';

const SoundCloudSignIn = () => {
  const handleSignIn = async () => {
    try {
      await soundCloudAuth.initiateAuth();
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Failed to initiate SoundCloud authentication');
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="soundcloud-signin-btn"
      style={{
        backgroundColor: '#ff5500',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#e64a00'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#ff5500'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm2 0h1v-8.448l-.621-.857c-.178-.309-.392-.592-.621-.857l.242.857v9.305zm3-2.506c-.146-.434-.321-.852-.527-1.241l-.473 1.241v2.506h1v-2.506zm2-1.441c-.508-.479-1.103-.85-1.766-1.103l-.234.103c.663.253 1.258.624 1.766 1.103l.234-.103zm1-2.439c-.508-.479-1.103-.85-1.766-1.103l-.234.103c.663.253 1.258.624 1.766 1.103l.234-.103z"/>
      </svg>
      Sign in with SoundCloud
    </button>
  );
};

export default SoundCloudSignIn;
```

#### User Profile Component

Create `components/UserProfile.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import soundCloudAuth from '../services/soundcloud.js';

const UserProfile = ({ accessToken, onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await soundCloudAuth.getUserProfile(accessToken);
        setUser(userData);
      } catch (err) {
        setError('Failed to load user profile');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchUserProfile();
    }
  }, [accessToken]);

  if (loading) {
    return <div>Loading user profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px', 
      maxWidth: '400px',
      margin: '20px auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        {user.avatar_url && (
          <img 
            src={user.avatar_url} 
            alt={user.username}
            style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        )}
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>{user.full_name || user.username}</h2>
          <p style={{ margin: 0, color: '#666' }}>@{user.username}</p>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Followers:</strong> {user.followers_count?.toLocaleString() || 0}</p>
        <p><strong>Following:</strong> {user.followings_count?.toLocaleString() || 0}</p>
        <p><strong>Tracks:</strong> {user.track_count?.toLocaleString() || 0}</p>
        <p><strong>Playlists:</strong> {user.playlist_count?.toLocaleString() || 0}</p>
      </div>

      {user.description && (
        <div style={{ marginBottom: '15px' }}>
          <p><strong>Bio:</strong></p>
          <p style={{ fontStyle: 'italic' }}>{user.description}</p>
        </div>
      )}

      {user.city && user.country && (
        <p><strong>Location:</strong> {user.city}, {user.country}</p>
      )}

      <button
        onClick={onLogout}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '15px'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
```

### 4. Main App Component

Create or update your main component (e.g., `App.jsx`):

```jsx
import React, { useState, useEffect } from 'react';
import SoundCloudSignIn from './components/SoundCloudSignIn.jsx';
import UserProfile from './components/UserProfile.jsx';
import soundCloudAuth from './services/soundcloud.js';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      setLoading(false);
      return;
    }

    if (code && state) {
      handleOAuthCallback(code, state);
    } else {
      // Check for stored token
      const storedToken = localStorage.getItem('soundcloud_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
      }
      setLoading(false);
    }
  }, []);

  const handleOAuthCallback = async (code, state) => {
    try {
      setLoading(true);
      const tokenData = await soundCloudAuth.exchangeCodeForToken(code, state);
      
      // Store tokens
      localStorage.setItem('soundcloud_access_token', tokenData.access_token);
      localStorage.setItem('soundcloud_refresh_token', tokenData.refresh_token);
      localStorage.setItem('soundcloud_expires_at', Date.now() + (tokenData.expires_in * 1000));
      
      setAccessToken(tokenData.access_token);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Token exchange error:', error);
      alert('Failed to complete authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('soundcloud_access_token');
    localStorage.removeItem('soundcloud_refresh_token');
    localStorage.removeItem('soundcloud_expires_at');
    setAccessToken(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>SoundCloud Integration Demo</h1>
      
      {!accessToken ? (
        <div>
          <p>Sign in with your SoundCloud account to get started.</p>
          <SoundCloudSignIn />
        </div>
      ) : (
        <UserProfile 
          accessToken={accessToken} 
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
```

## Backend Implementation (Optional)

If you prefer to handle token exchange on the backend:

### Express.js Route Handler

```javascript
// routes/auth.js
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.post('/soundcloud/token', async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;

    const response = await fetch('https://secure.soundcloud.com/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SOUNDCLOUD_CLIENT_ID,
        client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        code: code,
      }),
    });

    const tokenData = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: tokenData });
    }

    res.json(tokenData);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

## Security Best Practices

1. **State Parameter**: Always use and verify the `state` parameter to prevent CSRF attacks
2. **PKCE**: Use PKCE (Proof Key for Code Exchange) for additional security
3. **Token Storage**: Store tokens securely (consider using httpOnly cookies for production)
4. **Token Refresh**: Implement automatic token refresh using the refresh token
5. **Environment Variables**: Never expose client secrets in frontend code

## Token Management

### Automatic Token Refresh

```javascript
// utils/tokenManager.js
import soundCloudAuth from '../services/soundcloud.js';

export class TokenManager {
  static async getValidToken() {
    const accessToken = localStorage.getItem('soundcloud_access_token');
    const refreshToken = localStorage.getItem('soundcloud_refresh_token');
    const expiresAt = localStorage.getItem('soundcloud_expires_at');

    if (!accessToken) {
      return null;
    }

    // Check if token is expired
    if (Date.now() >= parseInt(expiresAt)) {
      if (refreshToken) {
        try {
          const newTokenData = await soundCloudAuth.refreshToken(refreshToken);
          
          localStorage.setItem('soundcloud_access_token', newTokenData.access_token);
          localStorage.setItem('soundcloud_expires_at', Date.now() + (newTokenData.expires_in * 1000));
          
          if (newTokenData.refresh_token) {
            localStorage.setItem('soundcloud_refresh_token', newTokenData.refresh_token);
          }
          
          return newTokenData.access_token;
        } catch (error) {
          console.error('Token refresh failed:', error);
          this.clearTokens();
          return null;
        }
      } else {
        this.clearTokens();
        return null;
      }
    }

    return accessToken;
  }

  static clearTokens() {
    localStorage.removeItem('soundcloud_access_token');
    localStorage.removeItem('soundcloud_refresh_token');
    localStorage.removeItem('soundcloud_expires_at');
  }
}
```

## Usage Examples

### Making Authenticated API Requests

```javascript
import { TokenManager } from './utils/tokenManager.js';

async function getUserTracks() {
  const accessToken = await TokenManager.getValidToken();
  
  if (!accessToken) {
    throw new Error('No valid access token');
  }

  const response = await fetch('https://api.soundcloud.com/me/tracks', {
    headers: {
      'Accept': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tracks');
  }

  return response.json();
}
```

## Troubleshooting

1. **Invalid Redirect URI**: Ensure the redirect URI in your app settings matches exactly
2. **CORS Issues**: Configure CORS properly if making requests from a different domain
3. **State Mismatch**: Verify that the state parameter is properly stored and retrieved
4. **Token Expiry**: Implement proper token refresh logic
5. **Client Secret Exposure**: Never include client secrets in frontend code

## Next Steps

- Implement error handling and user feedback
- Add loading states and better UX
- Set up proper session management
- Add logout functionality
- Implement token refresh automation
- Add proper TypeScript types if using TypeScript