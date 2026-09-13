import type { GetServerSideProps, NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { FillInBlank, Subject } from '../../lib/mock';
import { readJson } from '../../lib/http';
import { hasValidAdminSession } from '../../lib/admin-auth';
import { Pencil, PenLine, Trash2 } from 'lucide-react';

interface Form { subject_id: number; title: string; content: string; blanks: string }
const EMPTY: Form = { subject_id: 0, title: '', content: '', blanks: '{\n  "1": ""\n}' };

const FillBlanksAdmin: NextPage = () => {
  const [items, setItems] = useState<FillInBlank[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => { setLoading(true); const [itemsResponse, subjectsResponse] = await Promise.all([fetch('/api/admin/fill-blanks'), fetch('/api/admin/subjects')]); const itemsJson = await readJson(itemsResponse); const subjectsJson = await readJson(subjectsResponse); if (itemsJson.success) setItems(itemsJson.data); if (subjectsJson.success) { setSubjects(subjectsJson.data); setForm((current) => current.subject_id ? current : { ...current, subject_id: subjectsJson.data[0]?.id || 0 }); } setLoading(false); }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  const openCreate = () => { setEditingId(null); setForm({ ...EMPTY, subject_id: subjects[0]?.id || 0 }); setFormError(null); setModalOpen(true); };
  const openEdit = (item: FillInBlank) => { setEditingId(item.id); setForm({ subject_id: item.subject_id, title: item.title, content: item.content, blanks: item.blanks }); setFormError(null); setModalOpen(true); };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); try { JSON.parse(form.blanks); } catch { setFormError('Đáp án phải là JSON hợp lệ'); return; } const response = await fetch(editingId ? `/api/admin/fill-blanks/${editingId}` : '/api/admin/fill-blanks', { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const json = await readJson(response); if (!json.success) { setFormError(json.message); return; } setModalOpen(false); fetchData(); };
  const remove = async (id: number) => { if (!window.confirm('Xóa bài tập này?')) return; await fetch(`/api/admin/fill-blanks/${id}`, { method: 'DELETE' }); fetchData(); };
  const subjectName = (id: number) => subjects.find((subject) => subject.id === id)?.name || `#${id}`;
  return <AdminLayout title="Quản lý bài tập điền khuyết"><div className="admin-panel"><div className="admin-panel-header"><h2 className="admin-panel-title">Bài tập điền khuyết ({items.length})</h2><button className="btn-add" onClick={openCreate} type="button">+ Thêm bài tập</button></div>{loading ? <div className="loading-state"><div className="spinner" /><p>Đang tải...</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tiêu đề</th><th>Chủ đề</th><th>Số ô</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.title}</td><td>{subjectName(item.subject_id)}</td><td>{Object.keys(JSON.parse(item.blanks)).length}</td><td><div className="actions-cell"><button className="btn-icon" onClick={() => openEdit(item)} title="Sửa" type="button"><Pencil size={14} /></button><button className="btn-icon danger" onClick={() => remove(item.id)} title="Xóa" type="button"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>}</div>{modalOpen && <div className="modal-backdrop"><div className="modal"><div className="modal-header"><h3 className="modal-title">{editingId ? 'Sửa bài tập' : 'Thêm bài tập'}</h3><button className="modal-close" onClick={() => setModalOpen(false)} type="button">×</button></div><form onSubmit={submit}><div className="admin-form-grid"><div className="form-group full-width"><label>Chủ đề</label><select className="form-select" value={form.subject_id} onChange={(event) => setForm({ ...form, subject_id: Number(event.target.value) })}>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div><div className="form-group full-width"><label>Tiêu đề</label><input className="form-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div><div className="form-group full-width"><label>Nội dung, dùng {'{{1}}'}, {'{{2}}'} để tạo ô trống</label><textarea className="form-textarea" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></div><div className="form-group full-width"><label>Đáp án JSON</label><textarea className="form-textarea" value={form.blanks} onChange={(event) => setForm({ ...form, blanks: event.target.value })} placeholder={'{\n  "1": "đáp án đúng"\n}'} /></div></div>{formError && <p className="admin-login-error">{formError}</p>}<div className="form-actions"><button className="btn-cancel" onClick={() => setModalOpen(false)} type="button">Hủy</button><button className="btn-save" type="submit">Lưu</button></div></form></div></div>}</AdminLayout>;
};

export default FillBlanksAdmin;
export const getServerSideProps: GetServerSideProps = async ({ req }) => (await hasValidAdminSession(req) ? { props: {} } : { redirect: { destination: '/admin/login', permanent: false } });
