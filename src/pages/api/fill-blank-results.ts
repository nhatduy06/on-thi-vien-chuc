import type { NextApiRequest, NextApiResponse } from 'next';
import { createFillBlankResult } from '../../lib/store';
import { getAuthenticatedUserId } from '../../lib/supabase-server';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  const userId = await getAuthenticatedUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ success: false, data: null, message: 'Vui lòng đăng nhập để lưu kết quả' });
  const { fillBlankId, score, totalBlanks, correctBlanks } = req.body || {};
  if (!Number.isInteger(Number(fillBlankId))) return res.status(400).json({ success: false, data: null, message: 'Bài tập không hợp lệ' });
  try {
    const result = await createFillBlankResult({ userId, fillBlankId: Number(fillBlankId), score: Number(score) || 0, totalBlanks: Number(totalBlanks) || 0, correctBlanks: Number(correctBlanks) || 0 });
    return res.status(200).json({ success: true, data: result });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Không thể lưu kết quả' });
  }
}
