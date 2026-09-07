import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminSessionCookie, isAdminPassword } from '../../../../lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!(await isAdminPassword(password))) {
    return res.status(401).json({ success: false, message: 'Mật khẩu không đúng' });
  }

  const cookie = await createAdminSessionCookie();
  if (!cookie) {
    return res.status(503).json({ success: false, message: 'Chưa cấu hình ADMIN_PASSWORD trên server' });
  }

  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ success: true, message: 'Đăng nhập thành công' });
}
