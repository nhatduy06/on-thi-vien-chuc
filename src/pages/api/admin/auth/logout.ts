import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAdminSessionCookie } from '../../../../lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  res.setHeader('Set-Cookie', clearAdminSessionCookie());
  return res.status(200).json({ success: true, message: 'Đã đăng xuất' });
}
