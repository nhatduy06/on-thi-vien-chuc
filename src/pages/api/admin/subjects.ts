import type { NextApiRequest, NextApiResponse } from 'next';
import { listSubjects, createSubject } from '../../../lib/store';
import { requireAdmin } from '../../../lib/admin-auth';

type Data = { success: boolean; data: any; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!(await requireAdmin(req, res))) return;
  try {
    if (req.method === 'GET') {
      let categoryId: number | undefined;
      const raw = req.query.categoryId;
      if (raw) {
        const id = parseInt(raw as string, 10);
        if (isNaN(id)) {
          return res.status(400).json({ success: false, data: null, message: 'categoryId không hợp lệ' });
        }
        categoryId = id;
      }
      return res.status(200).json({ success: true, data: await listSubjects(categoryId) });
    }

    if (req.method === 'POST') {
      const { category_id, name, slug, description, display_order } = req.body || {};
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, data: null, message: 'Tên chủ đề là bắt buộc' });
      }
      if (!category_id || isNaN(Number(category_id))) {
        return res.status(400).json({ success: false, data: null, message: 'Danh mục là bắt buộc' });
      }
      const item = await createSubject({
        category_id: Number(category_id),
        name: name.trim(),
        slug,
        description,
        display_order,
      });
      return res.status(201).json({ success: true, data: item, message: 'Đã tạo chủ đề' });
    }

    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
