import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteArticle, updateArticle } from '../../../../lib/store';
import { requireAdmin } from '../../../../lib/admin-auth';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!(await requireAdmin(req, res))) return;
  const id = Number(req.query.id);
  if (!Number.isInteger(id)) return res.status(400).json({ success: false, data: null, message: 'ID không hợp lệ' });
  try {
    if (req.method === 'PUT') {
      const { title, excerpt, content, is_published, published_at } = req.body || {};
      if (!title?.trim()) return res.status(400).json({ success: false, data: null, message: 'Tiêu đề là bắt buộc' });
      const item = await updateArticle(id, { title: title.trim(), excerpt: String(excerpt || '').trim(), content: String(content || '').trim(), is_published: is_published !== false, published_at: published_at || new Date().toISOString() });
      if (!item) return res.status(404).json({ success: false, data: null, message: 'Không tìm thấy bài viết' });
      return res.status(200).json({ success: true, data: item, message: 'Đã cập nhật bài viết' });
    }
    if (req.method === 'DELETE') {
      const deleted = await deleteArticle(id);
      return res.status(deleted ? 200 : 404).json({ success: deleted, data: null, message: deleted ? 'Đã xóa bài viết' : 'Không tìm thấy bài viết' });
    }
    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
