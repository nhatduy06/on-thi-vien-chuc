import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { FillInBlank } from '../../lib/mock';
import { getAccessToken } from '../../lib/client-auth';

const PAGE_SIZE = 10;

function parseBlanks(item: FillInBlank) {
  try { return JSON.parse(item.blanks) as Record<string, string>; } catch { return {}; }
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[.,;:!?]+$/g, '').replace(/\s+/g, ' ');
}

const FillInListPage: NextPage = () => {
  const router = useRouter();
  const { subjectId } = router.query;
  const [items, setItems] = useState<FillInBlank[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<number, { correct: number; total: number }>>({});
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!router.isReady) return;
    setLoading(true);
    fetch(subjectId ? `/api/fill-blanks?subjectId=${subjectId}` : '/api/fill-blanks')
      .then((response) => response.json())
      .then((json) => setItems(json.success ? json.data : []))
      .catch(() => setMessage('Không thể tải bài tập'))
      .finally(() => setLoading(false));
  }, [router.isReady, subjectId]);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const checkedAnswers = useMemo(() => new Map(Object.entries(results)), [results]);

  const setAnswer = (itemId: number, key: string, value: string) => {
    setAnswers((current) => ({ ...current, [`${itemId}-${key}`]: value }));
  };

  const checkPage = async () => {
    const nextResults: Record<number, { correct: number; total: number }> = { ...results };
    for (const item of pageItems) {
      const blanks = parseBlanks(item);
      const keys = Object.keys(blanks);
      const correct = keys.filter((key) => normalize(answers[`${item.id}-${key}`] || '') === normalize(blanks[key])).length;
      nextResults[item.id] = { correct, total: keys.length };
    }
    setResults(nextResults);
    setChecked(true);
    setMessage(null);

    const token = await getAccessToken();
    const unsavedItems = pageItems.filter((item) => !savedIds.includes(item.id));
    if (!token) {
      setMessage('Bạn chưa đăng nhập, kết quả chỉ hiển thị tạm thời.');
      return;
    }
    if (unsavedItems.length === 0) {
      setMessage('Các bài trên trang này đã được lưu vào hồ sơ.');
      return;
    }
    await Promise.all(unsavedItems.map(async (item) => {
      const result = nextResults[item.id];
      await fetch('/api/fill-blank-results', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ fillBlankId: item.id, score: result.total ? Math.round((result.correct / result.total) * 10 * 10) / 10 : 0, totalBlanks: result.total, correctBlanks: result.correct }) });
    }));
    setSavedIds((current) => [...current, ...unsavedItems.map((item) => item.id)]);
    setMessage('Đã kiểm tra và lưu kết quả các bài trên trang.');
  };

  if (loading) return <Layout title="Bài tập điền khuyết - Viên Chức 247"><div className="loading-state"><div className="spinner" /><p>Đang tải bài tập...</p></div></Layout>;

  return <Layout title="Bài tập điền khuyết - Viên Chức 247"><section className="fill-list-page"><Link href="/" className="article-back">← Về trang chủ</Link><div className="fill-page-heading"><div><h1>Bài tập điền khuyết</h1><p className="fill-page-intro">Trang {page + 1}/{pageCount} · Điền đáp án rồi nhấn Kiểm tra để xem kết quả.</p></div><span>{items.length} bài tập</span></div>{items.length === 0 ? <div className="empty-state"><p>Chưa có bài tập điền khuyết nào.</p></div> : <div className="fill-exam-layout"><main className="fill-question-list">{pageItems.map((item, index) => { const blanks = parseBlanks(item); const keys = Object.keys(blanks); const result = checkedAnswers.get(String(item.id)); const parts = item.content.split(/(\{\{\d+\}\})/g); return <article className="fill-question-card" id={`fill-question-${page * PAGE_SIZE + index}`} key={item.id}><div className="fill-question-heading"><span>Câu {page * PAGE_SIZE + index + 1}</span>{result && <strong>Đúng {result.correct}/{result.total}</strong>}</div><h2>{item.title}</h2><div className="fill-document">{parts.map((part, partIndex) => { const match = part.match(/^\{\{(\d+)\}\}$/); if (!match) return <span key={partIndex}>{part}</span>; const key = match[1]; const answer = answers[`${item.id}-${key}`] || ''; const isCorrect = normalize(answer) === normalize(blanks[key]); return <span className="fill-blank-wrap" key={partIndex}><input aria-label={`Câu ${page * PAGE_SIZE + index + 1}, ô ${key}`} className={`fill-blank-input ${checked ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}`} value={answer} onChange={(event) => setAnswer(item.id, key, event.target.value)} /><b>{key}</b>{checked && !isCorrect && <small>Đáp án: {blanks[key]}</small>}</span>; })}</div>{checked && result && <div className="fill-inline-result">{result.correct === result.total ? 'Hoàn thành chính xác' : `Còn ${result.total - result.correct} đáp án cần xem lại`}</div>}</article>; })}<div className="fill-page-actions"><button className="btn btn-nav" disabled={page === 0} onClick={() => setPage((current) => current - 1)} type="button">← Trang trước</button><span>Trang {page + 1}/{pageCount}</span><button className="btn btn-primary" onClick={checkPage} type="button">Kiểm tra</button><button className="btn btn-nav" disabled={page === pageCount - 1} onClick={() => setPage((current) => current + 1)} type="button">Trang sau →</button></div>{message && <p className="saving-text">{message}</p>}</main><aside className="fill-question-sidebar"><h2>Danh sách bài</h2><p>Nhấp để chuyển trang.</p><div>{items.map((item, index) => <button className={`fill-sidebar-question ${answers[`${item.id}-${Object.keys(parseBlanks(item))[0]}`] ? 'answered' : ''} ${Math.floor(index / PAGE_SIZE) === page ? 'page-active' : ''}`} key={item.id} onClick={() => setPage(Math.floor(index / PAGE_SIZE))} type="button">{index + 1}</button>)}</div><small>● Đã điền &nbsp; ○ Chưa điền</small></aside></div>}</section></Layout>;
};

export default FillInListPage;
