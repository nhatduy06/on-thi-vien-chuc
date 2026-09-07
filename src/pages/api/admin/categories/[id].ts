import type { NextApiRequest, NextApiResponse } from 'next';
import { updateCategory, deleteCategory } from '../../../../lib/store';
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
      const updated = await updateCategory(id, req.body || {});
      if (!updated) {
        return res.status(404).json({ success: false, data: null, message: 'Không tìm thấy danh mục' });
      }
      return res.status(200).json({ success: true, data: updated, message: 'Đã cập nhật danh mục' });
    }

    if (req.method === 'DELETE') {
      const ok = await deleteCategory(id);
      if (!ok) {
        return res.status(404).json({ success: false, data: null, message: 'Không tìm thấy danh mục' });
      }
      return res.status(200).json({ success: true, data: null, message: 'Đã xóa danh mục' });
    }

    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
