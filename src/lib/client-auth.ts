import { getSupabaseBrowserClient } from './supabase-browser';

export async function getAccessToken(): Promise<string | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token || null;
}
