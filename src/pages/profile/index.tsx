import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getAccessToken } from '../../lib/client-auth';
import { Award, BarChart3, CheckCircle2, Clock3, UserCircle } from 'lucide-react';

interface ProfileData {
  user: { name: string; email: string; avatarUrl: string };
  stats: { totalAttempts: number; avgScore: number; bestScore: number; accuracy: number };
  subjectProgress: { subjectId: number; subjectName: string; attempts: number; avgScore: number; accuracy: number }[];
  results: { id: number; subjectName: string; score: number; totalQuestions: number; correctAnswers: number; timeSpent: number; completedAt: string }[];
}

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = await getAccessToken();
      if (!token) {
        await router.replace('/login?next=/profile');
        return;
      }
      try {
        const response = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });
        const json = await response.json();
        if (response.status === 401) return router.replace('/login?next=/profile');
        if (!response.ok || !json.success) throw new Error(json.message);
        setData(json.data);
      } catch {
        setError('Không thể tải dữ liệu cá nhân');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) return <Layout title="Hồ sơ - Viên Chức 247"><div className="loading-state"><div className="spinner" /><p>Đang tải hồ sơ...</p></div></Layout>;
  if (error || !data) return <Layout title="Hồ sơ - Viên Chức 247"><div className="error-state"><p className="error-message">{error || 'Không có dữ liệu hồ sơ'}</p></div></Layout>;

  return <Layout title="Hồ sơ - Viên Chức 247"><div className="profile-page"><section className="profile-header"><div className="profile-avatar">{data.user.avatarUrl ? <img src={data.user.avatarUrl} alt="" /> : <UserCircle size={34} />}</div><div><h1>{data.user.name}</h1><p>{data.user.email}</p></div></section><div className="profile-stat-grid"><div className="profile-stat"><Award size={19} /><strong>{data.stats.totalAttempts}</strong><span>Lượt thi</span></div><div className="profile-stat"><BarChart3 size={19} /><strong>{data.stats.avgScore}</strong><span>Điểm trung bình</span></div><div className="profile-stat"><CheckCircle2 size={19} /><strong>{data.stats.accuracy}%</strong><span>Tỷ lệ đúng</span></div><div className="profile-stat"><Award size={19} /><strong>{data.stats.bestScore}</strong><span>Điểm cao nhất</span></div></div><section className="profile-panel"><div className="profile-panel-heading"><h2>Tiến độ theo chủ đề</h2></div>{data.subjectProgress.length === 0 ? <p className="profile-empty">Bạn chưa có lượt thi nào.</p> : <div className="profile-progress-list">{data.subjectProgress.map((subject) => <div className="profile-progress-row" key={subject.subjectId}><div><strong>{subject.subjectName}</strong><span>{subject.attempts} lượt thi · {subject.accuracy}% đúng</span></div><b>{subject.avgScore}/10</b></div>)}</div>}</section><section className="profile-panel"><div className="profile-panel-heading"><h2>Lịch sử làm bài</h2></div>{data.results.length === 0 ? <p className="profile-empty">Chưa có lịch sử làm bài.</p> : <div className="profile-history-list">{data.results.map((result) => <Link href={`/profile/results/${result.id}`} className="profile-history-item" key={result.id}><div><strong>{result.subjectName}</strong><span>{new Date(result.completedAt).toLocaleString('vi-VN')} · {result.correctAnswers}/{result.totalQuestions} câu đúng</span></div><div><b>{result.score}/10</b><small><Clock3 size={13} /> {Math.floor(result.timeSpent / 60)} phút</small></div></Link>)}</div>}</section></div></Layout>;
};

export default ProfilePage;
