import type { NextApiRequest, NextApiResponse } from 'next';
import { createArticle, listArticles } from '../../../lib/store';
import { requireAdmin } from '../../../lib/admin-auth';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!(await requireAdmin(req, res))) return;
  try {
    if (req.method === 'GET') return res.status(200).json({ success: true, data: await listArticles(true) });
    if (req.method === 'POST') {
      const { title, excerpt, content, is_published, published_at } = req.body || {};
      if (!title?.trim()) return res.status(400).json({ success: false, data: null, message: 'Tiêu đề là bắt buộc' });
      const item = await createArticle({
        title: title.trim(),
        excerpt: String(excerpt || '').trim(),
        content: String(content || '').trim(),
        is_published: is_published !== false,
        published_at: published_at || new Date().toISOString(),
      });
      return res.status(201).json({ success: true, data: item, message: 'Đã tạo bài viết' });
    }
    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
