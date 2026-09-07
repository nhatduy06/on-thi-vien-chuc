import type { NextApiRequest, NextApiResponse } from 'next';
import { Question } from '../../lib/mock';
import { listQuestions } from '../../lib/store';

type Data = { success: boolean; data: Question[]; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, data: [], message: 'Method not allowed' });
  try {
    const subjectId = req.query.subjectId;
    let questions: Question[];
    if (subjectId) {
      const id = parseInt(subjectId as string, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, data: [], message: 'Invalid subjectId' });
      questions = await listQuestions(id);
    } else {
      questions = await listQuestions();
    }
    return res.status(200).json({ success: true, data: questions });
  } catch {
    return res.status(500).json({ success: false, data: [], message: 'Internal server error' });
  }
}
