import type { NextApiRequest, NextApiResponse } from 'next';
import { hasValidAdminSession } from '../../../../lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ authenticated: false, message: 'Method not allowed' });
  }
  const authenticated = await hasValidAdminSession(req);
  return res.status(200).json({ authenticated });
}
