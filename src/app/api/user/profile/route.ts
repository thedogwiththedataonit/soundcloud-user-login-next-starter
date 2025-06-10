import { NextResponse } from 'next/server';
import { SoundCloudAuth } from '@/lib/soundcloud';
import { TokenStore } from '@/lib/upstash';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('soundcloud_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Get user session
    const session = await TokenStore.getUserSession(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get valid access token
    const accessToken = await SoundCloudAuth.getValidAccessToken(session.user_id);
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No valid access token' }, { status: 401 });
    }

    // Get comprehensive user profile
    const userProfile = await SoundCloudAuth.getUserProfile(accessToken);

    // Log the full user profile to console as requested
    console.log('Authenticated user response (comprehensive):', userProfile);

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 