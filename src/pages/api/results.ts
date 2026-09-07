import type { NextApiRequest, NextApiResponse } from 'next';
import { createResult } from '../../lib/store';

type Data = { success: boolean; message?: string; data?: any };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    const { subjectId, score, totalQuestions, correctAnswers, timeSpent } = req.body;
    if (!subjectId || isNaN(Number(subjectId))) {
      return res.status(400).json({ success: false, message: 'subjectId không hợp lệ' });
    }
    const result = await createResult({
      subjectId: Number(subjectId),
      score: Number(score) || 0,
      totalQuestions: Number(totalQuestions) || 0,
      correctAnswers: Number(correctAnswers) || 0,
      timeSpent: Number(timeSpent) || 0,
    });
    return res.status(200).json({ success: true, data: result, message: 'Kết quả đã được lưu' });
  } catch {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}
