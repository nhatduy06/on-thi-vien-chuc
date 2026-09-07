import type { NextApiRequest, NextApiResponse } from 'next';
import { Category } from '../../../lib/mock';
import { listCategories, createCategory } from '../../../lib/store';
import { requireAdmin } from '../../../lib/admin-auth';

type Data = { success: boolean; data: any; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!(await requireAdmin(req, res))) return;
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: await listCategories() });
    }

    if (req.method === 'POST') {
      const { name, slug, description, icon, display_order } = req.body || {};
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, data: null, message: 'Tên danh mục là bắt buộc' });
      }
      const item = await createCategory({
        name: name.trim(),
        slug,
        description,
        icon,
        display_order,
      });
      return res.status(201).json({ success: true, data: item, message: 'Đã tạo danh mục' });
    }

    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
