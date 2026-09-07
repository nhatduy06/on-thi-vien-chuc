import type { NextApiRequest, NextApiResponse } from 'next';
import { listResults } from '../../../lib/store';
import { requireAdmin } from '../../../lib/admin-auth';

type Data = { success: boolean; data: any; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!(await requireAdmin(req, res))) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  }
  try {
    return res.status(200).json({ success: true, data: await listResults() });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
