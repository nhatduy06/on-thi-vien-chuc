import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteFillInBlank, updateFillInBlank } from '../../../../lib/store';
import { requireAdmin } from '../../../../lib/admin-auth';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!(await requireAdmin(req, res))) return;
  const id = Number(req.query.id);
  if (!Number.isInteger(id)) return res.status(400).json({ success: false, data: null, message: 'ID không hợp lệ' });
  try {
    if (req.method === 'PUT') {
      const { subject_id, title, content, blanks } = req.body || {};
      if (!Number.isInteger(Number(subject_id)) || !title?.trim() || !content?.trim() || !blanks?.trim()) return res.status(400).json({ success: false, data: null, message: 'Thiếu dữ liệu bắt buộc' });
      try { JSON.parse(blanks); } catch { return res.status(400).json({ success: false, data: null, message: 'Đáp án phải là JSON hợp lệ' }); }
      const item = await updateFillInBlank(id, { subject_id: Number(subject_id), title: title.trim(), content: content.trim(), blanks: blanks.trim() });
      if (!item) return res.status(404).json({ success: false, data: null, message: 'Không tìm thấy bài tập' });
      return res.status(200).json({ success: true, data: item, message: 'Đã cập nhật bài tập' });
    }
    if (req.method === 'DELETE') { const deleted = await deleteFillInBlank(id); return res.status(deleted ? 200 : 404).json({ success: deleted, data: null, message: deleted ? 'Đã xóa bài tập' : 'Không tìm thấy bài tập' }); }
    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  } catch { return res.status(500).json({ success: false, data: null, message: 'Lỗi server' }); }
}
