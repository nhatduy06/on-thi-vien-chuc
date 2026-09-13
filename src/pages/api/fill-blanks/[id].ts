import type { NextApiRequest, NextApiResponse } from 'next';
import { listFillInBlanks } from '../../../lib/store';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  const id = Number(req.query.id);
  if (!Number.isInteger(id)) return res.status(400).json({ success: false, data: null, message: 'ID không hợp lệ' });
  try {
    const item = (await listFillInBlanks()).find((exercise) => exercise.id === id);
    if (!item) return res.status(404).json({ success: false, data: null, message: 'Không tìm thấy bài tập' });
    return res.status(200).json({ success: true, data: item });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
