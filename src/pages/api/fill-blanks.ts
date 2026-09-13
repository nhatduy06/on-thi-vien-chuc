import type { NextApiRequest, NextApiResponse } from 'next';
import { listFillInBlanks } from '../../lib/store';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  const rawSubjectId = req.query.subjectId;
  const subjectId = rawSubjectId ? Number(rawSubjectId) : undefined;
  if (rawSubjectId && !Number.isInteger(subjectId)) return res.status(400).json({ success: false, data: null, message: 'subjectId không hợp lệ' });
  try {
    return res.status(200).json({ success: true, data: await listFillInBlanks(subjectId) });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
