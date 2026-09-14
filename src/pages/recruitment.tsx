import type { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import type { RecruitmentNotice } from '../lib/store';

const RecruitmentPage: NextPage = () => {
  const [notices, setNotices] = useState<RecruitmentNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');

  useEffect(() => {
    fetch('/api/recruitment-notices').then((response) => response.json()).then((json) => { if (json.success) setNotices(json.data); }).finally(() => setLoading(false));
  }, []);

  const provinces = useMemo(() => [...new Set(notices.map((notice) => notice.province).filter(Boolean))] as string[], [notices]);
  const filtered = notices.filter((notice) => (!province || notice.province === province) && (!search || `${notice.title} ${notice.excerpt}`.toLowerCase().includes(search.toLowerCase())));

  return <Layout title="Thông báo tuyển dụng - Viên Chức 247"><section className="recruitment-page"><div className="recruitment-heading"><span className="home-section-kicker">Cơ hội mới</span><h1>Thông báo tuyển dụng viên chức giáo dục</h1><p>Các thông báo tuyển dụng được tổng hợp và liên kết tới trang gốc.</p></div><div className="recruitment-filters"><input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm thông báo..." /><select className="form-select" value={province} onChange={(event) => setProvince(event.target.value)}><option value="">Tất cả tỉnh/thành</option>{provinces.map((item) => <option value={item} key={item}>{item}</option>)}</select></div>{loading ? <div className="loading-state"><div className="spinner" /><p>Đang tải thông báo...</p></div> : filtered.length === 0 ? <div className="empty-state"><p>Chưa có thông báo phù hợp.</p></div> : <div className="recruitment-list">{filtered.map((notice) => <article className="recruitment-card" key={notice.id}><div className="recruitment-card-meta"><span>Thông báo tuyển dụng</span>{notice.province && <span>{notice.province}</span>}<time>{notice.published_at ? new Date(notice.published_at).toLocaleDateString('vi-VN') : ''}</time></div><h2>{notice.title}</h2>{notice.excerpt && <p>{notice.excerpt}</p>}<a href={notice.official_url || notice.aggregator_url} target="_blank" rel="noreferrer" className="article-read-link">Xem thông báo gốc <span aria-hidden="true">→</span></a></article>)}</div>}</section></Layout>;
};

export default RecruitmentPage;
