import type { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { readJson } from '../../lib/http';
import { hasValidAdminSession } from '../../lib/admin-auth';
import { Award, BarChart3, RefreshCw } from 'lucide-react';

interface ExamResult {
  id: number;
  subjectId: number;
  subjectName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
}

const ResultsAdmin: NextPage = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/results');
      const json = await readJson(res);
      if (json.success) setResults(json.data);
      else setError(json.message || 'Không thể tải kết quả');
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const fmtDate = (iso: string) => new Date(iso).toLocaleString('vi-VN');
  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${(sec < 10 ? '0' : '') + sec}`;
  };

  const avgScore = results.length > 0
    ? Math.round((results.reduce((sum, r) => sum + r.score, 0) / results.length) * 10) / 10
    : 0;

  return (
    <AdminLayout title="Kết quả thi">
      <div className="stats-grid">
        <div className="stat-card">
            <div className="stat-card-icon"><Award size={18} /></div>
          <div>
            <div className="stat-card-value">{results.length}</div>
            <div className="stat-card-label">Tổng lượt thi</div>
          </div>
        </div>
        <div className="stat-card">
            <div className="stat-card-icon"><BarChart3 size={18} /></div>
          <div>
            <div className="stat-card-value">{avgScore}</div>
            <div className="stat-card-label">Điểm trung bình</div>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Danh sách bài thi ({results.length})</h2>
          <button className="btn-cancel" onClick={fetchResults}><RefreshCw size={14} /> Làm mới</button>
        </div>

        {loading && (
          <div className="loading-state" style={{ border: 'none', boxShadow: 'none', margin: '20px auto' }}>
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="error-state" style={{ border: 'none', boxShadow: 'none', margin: '20px auto' }}>
            <p className="error-message">{error}</p>
            <button className="btn btn-retry" onClick={fetchResults}>Thử lại</button>
          </div>
        )}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Chủ đề</th>
                  <th>Điểm</th>
                  <th>Câu đúng</th>
                  <th>Thời gian làm</th>
                  <th>Hoàn thành lúc</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="admin-empty">
                        <div className="admin-empty-icon"><Award size={28} /></div>
                        <p>Chưa có lượt thi nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {results.map((r) => {
                  const passRate = r.totalQuestions > 0 ? r.correctAnswers / r.totalQuestions : 0;
                  const cls = passRate >= 0.6 ? 'badge-success' : passRate >= 0.4 ? 'badge-warning' : 'badge-danger';
                  return (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td style={{ fontWeight: 600 }}>{r.subjectName}</td>
                      <td><span className={`badge ${cls}`}>{r.score}/10</span></td>
                      <td>{r.correctAnswers}/{r.totalQuestions}</td>
                      <td>{fmtTime(r.timeSpent)}</td>
                      <td>{fmtDate(r.completedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ResultsAdmin;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!(await hasValidAdminSession(req))) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
};
