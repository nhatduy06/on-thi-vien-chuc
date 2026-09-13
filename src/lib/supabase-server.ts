import { createClient } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

function getServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export async function getAuthenticatedUserId(authorizationHeader?: string): Promise<string | null> {
  const user = await getAuthenticatedUser(authorizationHeader);
  return user?.id || null;
}

export async function getAuthenticatedUser(authorizationHeader?: string): Promise<AuthenticatedUser | null> {
  const token = authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  const client = getServerClient();
  if (!token || !client) return null;

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  const metadata = data.user.user_metadata || {};
  return {
    id: data.user.id,
    email: data.user.email || '',
    name: String(metadata.full_name || metadata.name || data.user.email || 'Học viên'),
    avatarUrl: String(metadata.avatar_url || metadata.picture || ''),
  };
}
