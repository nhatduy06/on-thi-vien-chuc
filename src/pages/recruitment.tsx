import type { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import type { RecruitmentNotice } from '../lib/store';
import { cleanNoticeExcerpt, getNoticeProvince } from '../lib/recruitment';

const RecruitmentPage: NextPage = () => {
  const [notices, setNotices] = useState<RecruitmentNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');

  useEffect(() => {
    fetch('/api/recruitment-notices').then((response) => response.json()).then((json) => { if (json.success) setNotices(json.data); }).finally(() => setLoading(false));
  }, []);

  const provinces = useMemo(() => [...new Set(notices.map(getNoticeProvince).filter(Boolean))], [notices]);
  const filtered = notices.filter((notice) => (!province || getNoticeProvince(notice) === province) && (!search || `${notice.title} ${cleanNoticeExcerpt(notice.excerpt)}`.toLowerCase().includes(search.toLowerCase())));

  return <Layout title="Vienchuc247 - Tuyển dụng"><section className="recruitment-page"><div className="recruitment-heading"><h1>Thông báo tuyển dụng viên chức giáo dục</h1><p>Các thông báo tuyển dụng được tổng hợp và liên kết tới trang gốc.</p></div><div className="recruitment-filters"><input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm thông báo..." /><select className="form-select" value={province} onChange={(event) => setProvince(event.target.value)}><option value="">Tất cả tỉnh/thành</option>{provinces.map((item) => <option value={item} key={item}>{item}</option>)}</select></div>{loading ? <div className="loading-state"><div className="spinner" /><p>Đang tải thông báo...</p></div> : filtered.length === 0 ? <div className="empty-state"><p>Chưa có thông báo phù hợp.</p></div> : <div className="recruitment-list">{filtered.map((notice) => <article className="recruitment-card" key={notice.id}><div className="recruitment-card-meta">{getNoticeProvince(notice) && <span>{getNoticeProvince(notice)}</span>}<time>{notice.published_at ? new Date(notice.published_at).toLocaleDateString('vi-VN') : ''}</time></div><h2><a href={notice.official_url || notice.aggregator_url} target="_blank" rel="noreferrer">{notice.title}</a></h2>{cleanNoticeExcerpt(notice.excerpt) && <p>{cleanNoticeExcerpt(notice.excerpt)}</p>}</article>)}</div>}</section></Layout>;
};

export default RecruitmentPage;
