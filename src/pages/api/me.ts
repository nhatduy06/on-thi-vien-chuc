import type { NextApiRequest, NextApiResponse } from 'next';
import { listResultsByUser } from '../../lib/store';
import { getAuthenticatedUser } from '../../lib/supabase-server';

type Data = { success: boolean; data: unknown; message?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  const user = await getAuthenticatedUser(req.headers.authorization);
  if (!user) return res.status(401).json({ success: false, data: null, message: 'Vui lòng đăng nhập' });
  try {
    const results = await listResultsByUser(user.id);
    const totalAttempts = results.length;
    const avgScore = totalAttempts ? Math.round((results.reduce((sum, result) => sum + result.score, 0) / totalAttempts) * 10) / 10 : 0;
    const bestScore = totalAttempts ? Math.max(...results.map((result) => result.score)) : 0;
    const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0);
    const correctAnswers = results.reduce((sum, result) => sum + result.correctAnswers, 0);
    const subjectMap = new Map<number, { subjectId: number; subjectName: string; attempts: number; scoreTotal: number; correct: number; total: number }>();
    for (const result of results) {
      const current = subjectMap.get(result.subjectId) || { subjectId: result.subjectId, subjectName: result.subjectName, attempts: 0, scoreTotal: 0, correct: 0, total: 0 };
      current.attempts += 1;
      current.scoreTotal += result.score;
      current.correct += result.correctAnswers;
      current.total += result.totalQuestions;
      subjectMap.set(result.subjectId, current);
    }
    const subjectProgress = [...subjectMap.values()].map((subject) => ({ subjectId: subject.subjectId, subjectName: subject.subjectName, attempts: subject.attempts, avgScore: Math.round((subject.scoreTotal / subject.attempts) * 10) / 10, accuracy: subject.total ? Math.round((subject.correct / subject.total) * 100) : 0 }));
    return res.status(200).json({ success: true, data: { user, stats: { totalAttempts, avgScore, bestScore, accuracy: totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0 }, subjectProgress, results } });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Lỗi server' });
  }
}
