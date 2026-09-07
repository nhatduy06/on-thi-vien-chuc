import type { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Category } from '../../lib/mock';
import { readJson } from '../../lib/http';
import { hasValidAdminSession } from '../../lib/admin-auth';
import { Library, Pencil, Trash2 } from 'lucide-react';
import CategoryIcon from '../../components/CategoryIcon';

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  icon: 'book-open',
  display_order: 1,
};

const CategoriesAdmin: NextPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/categories');
      const json = await readJson(res);
      if (json.success) setCategories(json.data);
      else setError(json.message || 'Không thể tải danh mục');
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, display_order: categories.length + 1 });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      display_order: c.display_order,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Tên danh mục là bắt buộc');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
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
      fetchCategories();
    } catch {
      setFormError('Lỗi kết nối đến máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!window.confirm(`Xóa danh mục "${c.name}"? Tất cả chủ đề và câu hỏi thuộc danh mục này cũng sẽ bị xóa.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' });
      const json = await readJson(res);
      if (json.success) fetchCategories();
      else alert(json.message || 'Có lỗi xảy ra');
    } catch {
      alert('Lỗi kết nối đến máy chủ');
    }
  };

  return (
    <AdminLayout title="Quản lý danh mục">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Danh sách danh mục ({categories.length})</h2>
          <button className="btn-add" onClick={openCreate}>+ Thêm danh mục</button>
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
            <button className="btn btn-retry" onClick={fetchCategories}>Thử lại</button>
          </div>
        )}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Tên</th>
                  <th>Slug</th>
                  <th>Mô tả</th>
                  <th>Thứ tự</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="admin-empty">
                         <div className="admin-empty-icon"><Library size={28} /></div>
                        <p>Chưa có danh mục nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {categories.map((c) => (
                  <tr key={c.id}>
                     <td><CategoryIcon slug={c.slug} size={19} /></td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className="badge badge-primary">{c.slug}</span></td>
                    <td className="cell-truncate" title={c.description}>{c.description}</td>
                    <td>{c.display_order}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon" title="Sửa" onClick={() => openEdit(c)}><Pencil size={14} /></button>
                        <button className="btn-icon danger" title="Xóa" onClick={() => handleDelete(c)}><Trash2 size={14} /></button>
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
              <h3 className="modal-title">{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Tên danh mục <span className="required">*</span></label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Kiến thức chung"
                  />
                </div>
                <div className="form-group">
                  <label>Slug (để trống sẽ tự tạo)</label>
                  <input
                    className="form-input"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="kien-thuc-chung"
                  />
                </div>
                <div className="form-group">
                  <label>Biểu tượng</label>
                  <input
                    className="form-input"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="Tự động theo danh mục"
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
                    placeholder="Mô tả ngắn về danh mục..."
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
                  {saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CategoriesAdmin;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!(await hasValidAdminSession(req))) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
};
