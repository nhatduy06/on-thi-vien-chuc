import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { FillInBlank } from '../../lib/mock';

const FillInListPage: NextPage = () => {
  const router = useRouter();
  const { subjectId } = router.query;
  const [items, setItems] = useState<FillInBlank[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!router.isReady) return;
    fetch(subjectId ? `/api/fill-blanks?subjectId=${subjectId}` : '/api/fill-blanks').then((response) => response.json()).then((json) => setItems(json.success ? json.data : [])).finally(() => setLoading(false));
  }, [router.isReady, subjectId]);
  return <Layout title="Bài tập điền khuyết - Viên Chức 247"><section className="fill-list-page"><Link href="/" className="article-back">← Về trang chủ</Link><h1>Bài tập điền khuyết</h1><p className="fill-page-intro">Đọc văn bản và điền các nội dung còn thiếu để củng cố kiến thức.</p>{loading ? <div className="loading-state"><div className="spinner" /><p>Đang tải bài tập...</p></div> : items.length === 0 ? <div className="empty-state"><p>Chưa có bài tập điền khuyết nào.</p></div> : <div className="fill-list">{items.map((item) => <Link href={`/fill-in/${item.id}`} className="fill-list-item" key={item.id}><h2>{item.title}</h2><p>{item.content.replace(/\{\{\d+\}\}/g, '______')}</p><span>Làm bài →</span></Link>)}</div>}</section></Layout>;
};

export default FillInListPage;
