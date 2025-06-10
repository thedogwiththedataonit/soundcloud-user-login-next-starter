import { NextRequest, NextResponse } from 'next/server';
import { SoundCloudAuth } from '@/lib/soundcloud';
import { TokenStore } from '@/lib/upstash';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's liked tracks
    const likedTracks = await SoundCloudAuth.getUserLikedTracks(accessToken, limit, offset);

    // Log the liked tracks response to console
    console.log('User liked tracks response:', {
      total_tracks: likedTracks.collection.length,
      has_next: !!likedTracks.next_href,
      tracks: likedTracks.collection.slice(0, 3).map(track => ({
        id: track.id,
        title: track.title,
        artist: track.user.username,
        duration: track.duration,
        plays: track.playback_count
      }))
    });

    return NextResponse.json(likedTracks);
  } catch (error) {
    console.error('Error fetching liked tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liked tracks' },
      { status: 500 }
    );
  }
} 