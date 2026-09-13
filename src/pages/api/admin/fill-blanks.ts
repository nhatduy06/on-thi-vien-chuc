import type { NextApiRequest, NextApiResponse } from 'next';
import { createFillInBlank, listFillInBlanks } from '../../../lib/store';
import { requireAdmin } from '../../../lib/admin-auth';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!(await requireAdmin(req, res))) return;
  try {
    if (req.method === 'GET') return res.status(200).json({ success: true, data: await listFillInBlanks() });
    if (req.method === 'POST') {
      const { subject_id, title, content, blanks } = req.body || {};
      if (!Number.isInteger(Number(subject_id)) || !title?.trim() || !content?.trim() || !blanks?.trim()) return res.status(400).json({ success: false, data: null, message: 'Chủ đề, tiêu đề, nội dung và đáp án là bắt buộc' });
      try { JSON.parse(blanks); } catch { return res.status(400).json({ success: false, data: null, message: 'Đáp án phải là JSON hợp lệ' }); }
      return res.status(201).json({ success: true, data: await createFillInBlank({ subject_id: Number(subject_id), title: title.trim(), content: content.trim(), blanks: blanks.trim() }), message: 'Đã tạo bài tập' });
    }
    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  } catch { return res.status(500).json({ success: false, data: null, message: 'Lỗi server' }); }
}
