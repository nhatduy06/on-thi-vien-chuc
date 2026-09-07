import type { NextApiRequest, NextApiResponse } from 'next';

export const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type CookieRequest = Pick<NextApiRequest, 'headers'> | { headers: { cookie?: string } };

function getCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const item = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

async function getAdminSecret(): Promise<string | null> {
  const directSecret = typeof process !== 'undefined' ? process.env.ADMIN_PASSWORD : undefined;
  if (directSecret) return directSecret;

  if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) return null;
  return null;
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  let binary = '';
  new Uint8Array(signature).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function verifyPayload(payload: string, encodedSignature: string, secret: string): Promise<boolean> {
  try {
    const base64 = encodedSignature.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const signature = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    return await crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

export async function hasValidAdminSession(request: CookieRequest): Promise<boolean> {
  const secret = await getAdminSecret();
  if (!secret) return false;

  const session = getCookie(request.headers.cookie, ADMIN_COOKIE_NAME);
  if (!session) return false;

  const [expiresAt, signature] = session.split('.');
  const expires = Number(expiresAt);
  if (!expires || expires < Date.now() || !signature) return false;

  return verifyPayload(expiresAt, signature, secret);
}

export async function createAdminSessionCookie(): Promise<string | null> {
  const secret = await getAdminSecret();
  if (!secret) return null;

  const expiresAt = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  const signature = await signPayload(expiresAt, secret);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(`${expiresAt}.${signature}`)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export async function isAdminPassword(password: string): Promise<boolean> {
  const secret = await getAdminSecret();
  return Boolean(secret && password && password === secret);
}

export function clearAdminSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  if (await hasValidAdminSession(req)) return true;
  res.status(401).json({ success: false, data: null, message: 'Yêu cầu đăng nhập quản trị' });
  return false;
}
