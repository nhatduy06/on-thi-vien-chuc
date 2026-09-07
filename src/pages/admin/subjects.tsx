import type { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Category, Subject } from '../../lib/mock';
import { readJson } from '../../lib/http';
import { hasValidAdminSession } from '../../lib/admin-auth';
import { FileText, Pencil, Trash2 } from 'lucide-react';

interface SubjectForm {
  category_id: number;
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

const SubjectsAdmin: NextPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SubjectForm>({ category_id: 0, name: '', slug: '', description: '', display_order: 1 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async (categoryId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = categoryId ? `/api/admin/subjects?categoryId=${categoryId}` : '/api/admin/subjects';
      const res = await fetch(url);
      const json = await readJson(res);
      if (json.success) setSubjects(json.data);
      else setError(json.message || 'Không thể tải chủ đề');
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => readJson(r))
      .then((json) => {
        if (json.success) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setForm((f) => (f.category_id === 0 ? { ...f, category_id: json.data[0].id } : f));
          }
        }
      })
      .catch(() => {});
    fetchSubjects();
  }, [fetchSubjects]);

  const catName = (id: number) => categories.find((c) => c.id === id)?.name || `#${id}`;

  const openCreate = () => {
    setEditingId(null);
    setForm({
      category_id: filterCategory ? Number(filterCategory) : categories[0]?.id || 0,
      name: '',
      slug: '',
      description: '',
      display_order: subjects.length + 1,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditingId(s.id);
    setForm({
      category_id: s.category_id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      display_order: s.display_order,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Tên chủ đề là bắt buộc');
      return;
    }
    if (!form.category_id) {
      setFormError('Vui lòng chọn danh mục');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const url = editingId ? `/api/admin/subjects/${editingId}` : '/api/admin/subjects';
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
      fetchSubjects(filterCategory || undefined);
    } catch {
      setFormError('Lỗi kết nối đến máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Subject) => {
    if (!window.confirm(`Xóa chủ đề "${s.name}"? Tất cả câu hỏi thuộc chủ đề này cũng sẽ bị xóa.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/subjects/${s.id}`, { method: 'DELETE' });
      const json = await readJson(res);
      if (json.success) fetchSubjects(filterCategory || undefined);
      else alert(json.message || 'Có lỗi xảy ra');
    } catch {
      alert('Lỗi kết nối đến máy chủ');
    }
  };

  return (
    <AdminLayout title="Quản lý chủ đề">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Danh sách chủ đề ({subjects.length})</h2>
          <div className="admin-filter-bar">
            <select
              className="form-select"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                fetchSubjects(e.target.value || undefined);
              }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button className="btn-add" onClick={openCreate}>+ Thêm chủ đề</button>
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
            <button className="btn btn-retry" onClick={() => fetchSubjects(filterCategory || undefined)}>Thử lại</button>
          </div>
        )}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên chủ đề</th>
                  <th>Danh mục</th>
                  <th>Slug</th>
                  <th>Số câu hỏi</th>
                  <th>Thứ tự</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="admin-empty">
                         <div className="admin-empty-icon"><FileText size={28} /></div>
                        <p>Chưa có chủ đề nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td><span className="badge badge-primary">{catName(s.category_id)}</span></td>
                    <td className="cell-truncate" title={s.slug}>{s.slug}</td>
                    <td><span className="badge badge-success">{s.question_count} câu</span></td>
                    <td>{s.display_order}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon" title="Sửa" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                        <button className="btn-icon danger" title="Xóa" onClick={() => handleDelete(s)}><Trash2 size={14} /></button>
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
              <h3 className="modal-title">{editingId ? 'Sửa chủ đề' : 'Thêm chủ đề mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Danh mục <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                  >
                    {categories.map((c) => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tên chủ đề <span className="required">*</span></label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Luật viên chức 2026"
                  />
                </div>
                <div className="form-group">
                  <label>Slug (để trống sẽ tự tạo)</label>
                  <input
                    className="form-input"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="luat-vien-chuc-2026"
                  />
                </div>
                <div className="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Mô tả</label>
                  <textarea
                    className="form-textarea"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả ngắn về chủ đề..."
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
                  {saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo chủ đề'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SubjectsAdmin;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!(await hasValidAdminSession(req))) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
};
