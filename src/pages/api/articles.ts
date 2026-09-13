import type { NextApiRequest, NextApiResponse } from 'next';
import { listArticles } from '../../lib/store';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  try {
    return res.status(200).json({ success: true, data: await listArticles() });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
