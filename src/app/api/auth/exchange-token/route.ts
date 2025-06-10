import { NextRequest, NextResponse } from 'next/server';
import { SoundCloudAuth } from '@/lib/soundcloud';
import { TokenStore } from '@/lib/upstash';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const { tokens, sessionId } = await SoundCloudAuth.exchangeCodeForToken(code, state);
    
    // Get user profile
    const userProfile = await SoundCloudAuth.getUserProfile(tokens.access_token);
    
    // Store tokens in Upstash
    await TokenStore.storeUserTokens(userProfile.id.toString(), {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    });

    // Store user session
    await TokenStore.storeUserSession(sessionId, userProfile.id.toString());

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('soundcloud_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Log the user profile to console as requested
    console.log('Authenticated user response:', userProfile);

    return NextResponse.json({ 
      success: true, 
      user: userProfile 
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange code for token' },
      { status: 500 }
    );
  }
} 