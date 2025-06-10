import { NextResponse } from 'next/server';
import { SoundCloudAuth } from '@/lib/soundcloud';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    // Generate a session ID for this user
    const sessionId = uuidv4();
    
    // Generate the OAuth authorization URL
    const authUrl = await SoundCloudAuth.generateAuthUrl(sessionId);
    
    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('soundcloud_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating SoundCloud auth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
} 