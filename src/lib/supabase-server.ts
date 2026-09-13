import { createClient } from '@supabase/supabase-js';

function getServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export async function getAuthenticatedUserId(authorizationHeader?: string): Promise<string | null> {
  const token = authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  const client = getServerClient();
  if (!token || !client) return null;

  const { data, error } = await client.auth.getUser(token);
  return error || !data.user ? null : data.user.id;
}
