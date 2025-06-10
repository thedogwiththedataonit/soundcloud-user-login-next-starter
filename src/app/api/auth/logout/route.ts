import { NextResponse } from 'next/server';
import { TokenStore } from '@/lib/upstash';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('soundcloud_session')?.value;

    if (sessionId) {
      // Delete user session from Upstash
      await TokenStore.deleteUserSession(sessionId);
      
      // Clear session cookie
      cookieStore.delete('soundcloud_session');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 