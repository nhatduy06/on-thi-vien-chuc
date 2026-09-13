import type { NextApiRequest, NextApiResponse } from 'next';
import { listResultsByUser } from '../../../../lib/store';
import { getAuthenticatedUserId } from '../../../../lib/supabase-server';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  const userId = await getAuthenticatedUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ success: false, data: null, message: 'Vui lòng đăng nhập' });
  try {
    return res.status(200).json({ success: true, data: await listResultsByUser(userId) });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
