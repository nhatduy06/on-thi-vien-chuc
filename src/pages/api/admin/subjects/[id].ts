import type { NextApiRequest, NextApiResponse } from 'next';
import { updateSubject, deleteSubject } from '../../../../lib/store';
import { requireAdmin } from '../../../../lib/admin-auth';

type Data = { success: boolean; data: any; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!(await requireAdmin(req, res))) return;
  const id = parseInt(req.query.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, data: null, message: 'ID không hợp lệ' });
  }

  try {
    if (req.method === 'PUT') {
      const updated = await updateSubject(id, req.body || {});
      if (!updated) {
        return res.status(404).json({ success: false, data: null, message: 'Không tìm thấy chủ đề' });
      }
      return res.status(200).json({ success: true, data: updated, message: 'Đã cập nhật chủ đề' });
    }

    if (req.method === 'DELETE') {
      const ok = await deleteSubject(id);
      if (!ok) {
        return res.status(404).json({ success: false, data: null, message: 'Không tìm thấy chủ đề' });
      }
      return res.status(200).json({ success: true, data: null, message: 'Đã xóa chủ đề' });
    }

    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
