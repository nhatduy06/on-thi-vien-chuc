import type { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Category, Question, Subject } from '../../lib/mock';
import { readJson } from '../../lib/http';
import { hasValidAdminSession } from '../../lib/admin-auth';
import { CircleHelp, Pencil, Trash2 } from 'lucide-react';

interface QuestionForm {
  subject_id: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const EMPTY_FORM: QuestionForm = {
  subject_id: 0,
  content: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
  explanation: '',
  difficulty: 'medium',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

const DIFFICULTY_CLASS: Record<string, string> = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-danger',
};

const QuestionsAdmin: NextPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<QuestionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async (subjectId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = subjectId ? `/api/admin/questions?subjectId=${subjectId}` : '/api/admin/questions';
      const res = await fetch(url);
      const json = await readJson(res);
      if (json.success) setQuestions(json.data);
      else setError(json.message || 'Không thể tải câu hỏi');
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => readJson(r))
      .then((json) => json.success && setCategories(json.data))
      .catch(() => {});
    fetch('/api/admin/subjects')
      .then((r) => readJson(r))
      .then((json) => {
        if (json.success) {
          setSubjects(json.data);
          if (json.data.length > 0) {
            setForm((f) => (f.subject_id === 0 ? { ...f, subject_id: json.data[0].id } : f));
          }
        }
      })
      .catch(() => {});
    fetchQuestions();
  }, [fetchQuestions]);

  const availableSubjects = filterCategory
    ? subjects.filter((s) => s.category_id === Number(filterCategory))
    : subjects;

  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name || `#${id}`;

  const filtered = questions.filter((q) => {
    if (filterSubject && q.subject_id !== Number(filterSubject)) return false;
    if (search && !q.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      subject_id: filterSubject ? Number(filterSubject) : availableSubjects[0]?.id || 0,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({
      subject_id: q.subject_id,
      content: q.content,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject_id) {
      setFormError('Vui lòng chọn chủ đề');
      return;
    }
    if (!form.content.trim()) {
      setFormError('Nội dung câu hỏi là bắt buộc');
      return;
    }
    if (!form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setFormError('Đủ 4 đáp án A, B, C, D là bắt buộc');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const url = editingId ? `/api/admin/questions/${editingId}` : '/api/admin/questions';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await readJson(res);
      if (!json.success) {
        setFormError(json.message || 'Có lỗi xảy ra');
        return;
      }
      setModalOpen(false);
      fetchQuestions(filterSubject || undefined);
    } catch {
      setFormError('Lỗi kết nối đến máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q: Question) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    try {
      const res = await fetch(`/api/admin/questions/${q.id}`, { method: 'DELETE' });
      const json = await readJson(res);
      if (json.success) fetchQuestions(filterSubject || undefined);
      else alert(json.message || 'Có lỗi xảy ra');
    } catch {
      alert('Lỗi kết nối đến máy chủ');
    }
  };

  return (
    <AdminLayout title="Quản lý câu hỏi">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Danh sách câu hỏi ({filtered.length})</h2>
          <div className="admin-filter-bar">
            <select
              className="form-select"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubject('');
              }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={filterSubject}
              onChange={(e) => {
                setFilterSubject(e.target.value);
                fetchQuestions(e.target.value || undefined);
              }}
            >
              <option value="">Tất cả chủ đề</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm câu hỏi..."
            />
            <button className="btn-add" onClick={openCreate}>+ Thêm câu hỏi</button>
          </div>
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
            <button className="btn btn-retry" onClick={() => fetchQuestions(filterSubject || undefined)}>Thử lại</button>
          </div>
        )}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nội dung</th>
                  <th>Chủ đề</th>
                  <th>Đáp án</th>
                  <th>Độ khó</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="admin-empty">
                         <div className="admin-empty-icon"><CircleHelp size={28} /></div>
                        <p>Chưa có câu hỏi nào phù hợp.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {filtered.map((q) => (
                  <tr key={q.id}>
                    <td>{q.id}</td>
                    <td className="cell-truncate" style={{ maxWidth: 380 }} title={q.content}>{q.content}</td>
                    <td><span className="badge badge-primary">{subjectName(q.subject_id)}</span></td>
                    <td><span className="badge badge-success">{q.correct_answer}</span></td>
                    <td>
                      <span className={`badge ${DIFFICULTY_CLASS[q.difficulty]}`}>
                        {DIFFICULTY_LABEL[q.difficulty]}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon" title="Sửa" onClick={() => openEdit(q)}><Pencil size={14} /></button>
                        <button className="btn-icon danger" title="Xóa" onClick={() => handleDelete(q)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Chủ đề <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={form.subject_id}
                    onChange={(e) => setForm({ ...form, subject_id: Number(e.target.value) })}
                  >
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Độ khó</label>
                  <select
                    className="form-select"
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as QuestionForm['difficulty'] })}
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Nội dung câu hỏi <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                </div>
                <div className="form-group">
                  <label>Đáp án A <span className="required">*</span></label>
                  <input
                    className="form-input"
                    value={form.option_a}
                    onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Đáp án B <span className="required">*</span></label>
                  <input
                    className="form-input"
                    value={form.option_b}
                    onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Đáp án C <span className="required">*</span></label>
                  <input
                    className="form-input"
                    value={form.option_c}
                    onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Đáp án D <span className="required">*</span></label>
                  <input
                    className="form-input"
                    value={form.option_d}
                    onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Đáp án đúng <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['A', 'B', 'C', 'D'] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        className={`btn ${form.correct_answer === k ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 18px', flex: 1 }}
                        onClick={() => setForm({ ...form, correct_answer: k })}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Giải thích</label>
                  <textarea
                    className="form-textarea"
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    placeholder="Giải thích đáp án đúng..."
                  />
                </div>
                {formError && (
                  <div className="form-group full-width">
                    <p className="error-message">{formError}</p>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default QuestionsAdmin;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!(await hasValidAdminSession(req))) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
};
