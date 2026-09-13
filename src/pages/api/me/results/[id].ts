import type { NextApiRequest, NextApiResponse } from 'next';
import { getResultReview } from '../../../../lib/store';
import { getAuthenticatedUserId } from '../../../../lib/supabase-server';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  const userId = await getAuthenticatedUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ success: false, data: null, message: 'Vui lòng đăng nhập' });
  const resultId = Number(req.query.id);
  if (!Number.isInteger(resultId)) return res.status(400).json({ success: false, data: null, message: 'ID không hợp lệ' });
  try {
    const review = await getResultReview(userId, resultId);
    if (!review) return res.status(404).json({ success: false, data: null, message: 'Không tìm thấy bài thi' });
    return res.status(200).json({ success: true, data: review });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
