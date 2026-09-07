import type { NextApiRequest, NextApiResponse } from 'next';
import { listQuestions, createQuestion } from '../../../lib/store';
import { requireAdmin } from '../../../lib/admin-auth';

type Data = { success: boolean; data: any; message?: string };

const VALID_ANSWERS = ['A', 'B', 'C', 'D'];

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!(await requireAdmin(req, res))) return;
  try {
    if (req.method === 'GET') {
      let subjectId: number | undefined;
      const raw = req.query.subjectId;
      if (raw) {
        const id = parseInt(raw as string, 10);
        if (isNaN(id)) {
          return res.status(400).json({ success: false, data: null, message: 'subjectId không hợp lệ' });
        }
        subjectId = id;
      }
      return res.status(200).json({ success: true, data: await listQuestions(subjectId) });
    }

    if (req.method === 'POST') {
      const { subject_id, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty } = req.body || {};
      if (!subject_id || isNaN(Number(subject_id))) {
        return res.status(400).json({ success: false, data: null, message: 'Chủ đề là bắt buộc' });
      }
      if (!content || !option_a || !option_b || !option_c || !option_d) {
        return res.status(400).json({ success: false, data: null, message: 'Thiếu nội dung câu hỏi hoặc đáp án' });
      }
      if (!VALID_ANSWERS.includes(correct_answer)) {
        return res.status(400).json({ success: false, data: null, message: 'Đáp án đúng phải là A, B, C hoặc D' });
      }
      const item = await createQuestion({
        subject_id: Number(subject_id),
        content,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation: explanation || '',
        difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
      });
      return res.status(201).json({ success: true, data: item, message: 'Đã tạo câu hỏi' });
    }

    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
