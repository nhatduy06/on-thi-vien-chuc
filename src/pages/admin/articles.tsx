import type { GetServerSideProps, NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Article } from '../../lib/mock';
import { readJson } from '../../lib/http';
import { hasValidAdminSession } from '../../lib/admin-auth';
import { Newspaper, Pencil, Trash2 } from 'lucide-react';

interface ArticleForm {
  title: string;
  excerpt: string;
  content: string;
  is_published: boolean;
  published_at: string;
}

const EMPTY_FORM: ArticleForm = { title: '', excerpt: '', content: '', is_published: true, published_at: '' };

function toLocalInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const ArticlesAdmin: NextPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/articles');
      const json = await readJson(response);
      if (json.success) setArticles(json.data);
      else setError(json.message || 'Không thể tải bài viết');
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, published_at: toLocalInput(new Date().toISOString()) });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (article: Article) => {
    setEditingId(article.id);
    setForm({ title: article.title, excerpt: article.excerpt, content: article.content, is_published: article.is_published, published_at: toLocalInput(article.published_at) });
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return setFormError('Tiêu đề là bắt buộc');
    setSaving(true);
    setFormError(null);
    try {
      const response = await fetch(editingId ? `/api/admin/articles/${editingId}` : '/api/admin/articles', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, published_at: new Date(form.published_at).toISOString() }),
      });
      const json = await readJson(response);
      if (!json.success) return setFormError(json.message || 'Không thể lưu bài viết');
      setModalOpen(false);
      fetchArticles();
    } catch {
      setFormError('Lỗi kết nối đến máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (article: Article) => {
    if (!window.confirm(`Xóa bài viết “${article.title}”?`)) return;
    const response = await fetch(`/api/admin/articles/${article.id}`, { method: 'DELETE' });
    const json = await readJson(response);
    if (json.success) fetchArticles();
    else alert(json.message || 'Không thể xóa bài viết');
  };

  return (
    <AdminLayout title="Quản lý bài viết">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Bài viết cập nhật ({articles.length})</h2>
          <button className="btn-add" onClick={openCreate} type="button">+ Thêm bài viết</button>
        </div>
        {loading && <div className="loading-state" style={{ border: 'none', boxShadow: 'none', margin: '20px auto' }}><div className="spinner" /><p>Đang tải...</p></div>}
        {error && <div className="error-state"><p className="error-message">{error}</p><button className="btn btn-retry" onClick={fetchArticles} type="button">Thử lại</button></div>}
        {!loading && !error && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tiêu đề</th><th>Ngày đăng</th><th>Trạng thái</th><th /></tr></thead><tbody>
          {articles.length === 0 && <tr><td colSpan={4}><div className="admin-empty"><Newspaper size={28} /><p>Chưa có bài viết nào.</p></div></td></tr>}
          {articles.map((article) => <tr key={article.id}><td><strong>{article.title}</strong><div className="article-admin-excerpt">{article.excerpt}</div></td><td>{new Date(article.published_at).toLocaleString('vi-VN')}</td><td><span className={`badge ${article.is_published ? 'badge-success' : 'badge-warning'}`}>{article.is_published ? 'Đã đăng' : 'Bản nháp'}</span></td><td><div className="actions-cell"><button className="btn-icon" title="Sửa" onClick={() => openEdit(article)} type="button"><Pencil size={14} /></button><button className="btn-icon danger" title="Xóa" onClick={() => remove(article)} type="button"><Trash2 size={14} /></button></div></td></tr>)}
        </tbody></table></div>}
      </div>

      {modalOpen && <div className="modal-backdrop" onClick={(event) => event.target === event.currentTarget && setModalOpen(false)}><div className="modal"><div className="modal-header"><h3 className="modal-title">{editingId ? 'Sửa bài viết' : 'Thêm bài viết'}</h3><button className="modal-close" onClick={() => setModalOpen(false)} type="button">×</button></div><form onSubmit={submit}><div className="admin-form-grid"><div className="form-group full-width"><label>Tiêu đề <span className="required">*</span></label><input className="form-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div><div className="form-group full-width"><label>Mô tả ngắn</label><textarea className="form-textarea" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} /></div><div className="form-group full-width"><label>Nội dung</label><textarea className="form-textarea" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></div><div className="form-group"><label>Ngày đăng</label><input className="form-input" type="datetime-local" value={form.published_at} onChange={(event) => setForm({ ...form, published_at: event.target.value })} /></div><div className="form-group"><label>Trạng thái</label><label className="admin-checkbox"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> Hiển thị công khai</label></div></div>{formError && <p className="admin-login-error" style={{ padding: '0 22px' }}>{formError}</p>}<div className="form-actions"><button className="btn-cancel" onClick={() => setModalOpen(false)} type="button">Hủy</button><button className="btn-save" disabled={saving} type="submit">{saving ? 'Đang lưu...' : 'Lưu bài viết'}</button></div></form></div></div>}
    </AdminLayout>
  );
};

export default ArticlesAdmin;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!(await hasValidAdminSession(req))) return { redirect: { destination: '/admin/login', permanent: false } };
  return { props: {} };
};
