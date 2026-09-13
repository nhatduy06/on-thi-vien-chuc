import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import { Question } from '../../../lib/mock';
import { getAccessToken } from '../../../lib/client-auth';
import { CheckCircle2, Clock3, Lightbulb, XCircle } from 'lucide-react';

interface ReviewData {
  result: { subjectName: string; score: number; totalQuestions: number; correctAnswers: number; timeSpent: number; completedAt: string };
  details: { question: Question; selected: string; isCorrect: boolean }[];
}

const ReviewResultPage: NextPage = () => {
  const router = useRouter();
  const [data, setData] = useState<ReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!router.isReady) return;
    const load = async () => {
      const token = await getAccessToken();
      if (!token) return router.replace(`/login?next=/profile/results/${router.query.id}`);
      const response = await fetch(`/api/me/results/${router.query.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await response.json();
      if (response.status === 401) return router.replace('/login');
      if (!response.ok || !json.success) setError(json.message || 'Không thể tải bài thi');
      else setData(json.data);
    };
    load().catch(() => setError('Không thể tải bài thi'));
  }, [router]);

  if (!data && !error) return <Layout title="Xem lại bài thi - Viên Chức 247"><div className="loading-state"><div className="spinner" /><p>Đang tải bài thi...</p></div></Layout>;
  if (error || !data) return <Layout title="Xem lại bài thi - Viên Chức 247"><div className="error-state"><p className="error-message">{error}</p><Link href="/profile" className="btn btn-back">Về hồ sơ</Link></div></Layout>;
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return <Layout title="Xem lại bài thi - Viên Chức 247"><div className="profile-review-page"><Link href="/profile" className="article-back">← Về hồ sơ</Link><h1>{data.result.subjectName}</h1><p className="profile-review-date">{new Date(data.result.completedAt).toLocaleString('vi-VN')}</p><div className="result-stats"><div className="stat-item"><span className="stat-icon"><BarChartIcon /></span>Điểm: {data.result.score}/10</div><div className="stat-item correct"><span className="stat-icon"><CheckCircle2 size={17} /></span>Đúng: {data.result.correctAnswers}</div><div className="stat-item"><span className="stat-icon"><Clock3 size={17} /></span>Thời gian: {formatTime(data.result.timeSpent)}</div></div>{data.details.map((detail, index) => <div key={detail.question.id} className={`review-card ${detail.isCorrect ? 'correct' : 'incorrect'}`}><div className="review-question">Câu {index + 1}: {detail.question.content}</div><div className="review-answers">{(['A', 'B', 'C', 'D'] as const).map((key) => { const option = detail.question[`option_${key.toLowerCase()}` as keyof Question] as string; const correct = detail.question.correct_answer === key; const selected = detail.selected === key; return <div key={key} className={`review-option ${correct ? 'correct-answer' : selected ? 'wrong-answer' : ''}`}><span className="rev-key">{key}</span>{option}</div>; })}</div><div className="review-explanation"><Lightbulb size={16} /> {detail.question.explanation}</div></div>)}</div></Layout>;
};

function BarChartIcon() { return <span aria-hidden="true">▥</span>; }

export default ReviewResultPage;
