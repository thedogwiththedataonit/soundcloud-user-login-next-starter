import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface UserTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_id: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  expires_at: number;
}

export class TokenStore {
  // Store user tokens
  static async storeUserTokens(userId: string, tokens: Omit<UserTokens, 'user_id'>) {
    const userTokens: UserTokens = {
      ...tokens,
      user_id: userId,
    };
    
    await redis.set(`user:${userId}:tokens`, userTokens, {
      ex: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // Get user tokens
  static async getUserTokens(userId: string): Promise<UserTokens | null> {
    const tokens = await redis.get(`user:${userId}:tokens`);
    return tokens as UserTokens | null;
  }

  // Store temporary PKCE data during OAuth flow
  static async storePKCEData(state: string, data: { code_verifier: string; user_session_id: string }) {
    await redis.set(`pkce:${state}`, data, {
      ex: 60 * 10, // 10 minutes
    });
  }

  // Get and delete PKCE data
  static async getPKCEData(state: string): Promise<{ code_verifier: string; user_session_id: string } | null> {
    const data = await redis.get(`pkce:${state}`);
    if (data) {
      await redis.del(`pkce:${state}`);
    }
    return data as { code_verifier: string; user_session_id: string } | null;
  }

  // Store user session
  static async storeUserSession(sessionId: string, userId: string) {
    const session: UserSession = {
      id: sessionId,
      user_id: userId,
      expires_at: Date.now() + (60 * 60 * 24 * 7 * 1000), // 7 days
    };
    
    await redis.set(`session:${sessionId}`, session, {
      ex: 60 * 60 * 24 * 7, // 7 days
    });
  }

  // Get user session
  static async getUserSession(sessionId: string): Promise<UserSession | null> {
    const session = await redis.get(`session:${sessionId}`);
    return session as UserSession | null;
  }

  // Delete user session
  static async deleteUserSession(sessionId: string) {
    await redis.del(`session:${sessionId}`);
  }
}

export default redis; 