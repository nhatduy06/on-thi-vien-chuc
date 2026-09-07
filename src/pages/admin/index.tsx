import type { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import { readJson } from '../../lib/http';
import { hasValidAdminSession } from '../../lib/admin-auth';
import { Award, BarChart3, CircleHelp, FileText, Library } from 'lucide-react';

interface Stats {
  categories: number;
  subjects: number;
  questions: number;
  results: number;
  avgScore: number;
}

interface RecentResult {
  id: number;
  subjectName: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
}

const Dashboard: NextPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, resultsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/results'),
      ]);
      const statsJson = await readJson(statsRes);
      const resultsJson = await readJson(resultsRes);
      if (statsJson.success) setStats(statsJson.data);
      else setError(statsJson.message || 'Không thể tải thống kê');
      if (resultsJson.success) setRecent(resultsJson.data.slice(0, 5));
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fmtDate = (iso: string) => new Date(iso).toLocaleString('vi-VN');

  return (
    <AdminLayout title="Dashboard">
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="btn btn-retry" onClick={fetchData}>Thử lại</button>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon"><Library size={18} /></div>
              <div>
                <div className="stat-card-value">{stats.categories}</div>
                <div className="stat-card-label">Danh mục</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><FileText size={18} /></div>
              <div>
                <div className="stat-card-value">{stats.subjects}</div>
                <div className="stat-card-label">Chủ đề</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><CircleHelp size={18} /></div>
              <div>
                <div className="stat-card-value">{stats.questions}</div>
                <div className="stat-card-label">Câu hỏi</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><Award size={18} /></div>
              <div>
                <div className="stat-card-value">{stats.results}</div>
                <div className="stat-card-label">Lượt thi</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><BarChart3 size={18} /></div>
              <div>
                <div className="stat-card-value">{stats.avgScore}</div>
                <div className="stat-card-label">Điểm trung bình</div>
              </div>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">Bài thi gần đây</h2>
              <Link href="/admin/results" className="nav-link">Xem tất cả →</Link>
            </div>
            {recent.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><Award size={28} /></div>
                <p>Chưa có lượt thi nào.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Chủ đề</th>
                      <th>Điểm</th>
                      <th>Kết quả</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id}>
                        <td>{r.subjectName}</td>
                        <td>
                          <span className="badge badge-primary">{r.score}/10</span>
                        </td>
                        <td>{r.correctAnswers}/{r.totalQuestions} câu đúng</td>
                        <td>{fmtDate(r.completedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!(await hasValidAdminSession(req))) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
};
