import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { FillInBlank } from '../../lib/mock';
import { getAccessToken } from '../../lib/client-auth';

function normalize(value: string) { return value.trim().toLowerCase().replace(/[.,;:!?]+$/g, '').replace(/\s+/g, ' '); }

const FillInExercisePage: NextPage = () => {
  const router = useRouter();
  const [exercise, setExercise] = useState<FillInBlank | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!router.isReady) return;
    fetch(`/api/fill-blanks/${router.query.id}`).then((response) => response.json()).then((json) => { if (json.success) setExercise(json.data); else setError(json.message); }).catch(() => setError('Không thể tải bài tập'));
  }, [router.isReady, router.query.id]);

  const blanks = useMemo(() => {
    if (!exercise) return {} as Record<string, string>;
    try { return JSON.parse(exercise.blanks) as Record<string, string>; } catch { return {}; }
  }, [exercise]);
  const blankKeys = Object.keys(blanks).sort((a, b) => Number(a) - Number(b));
  const correctCount = blankKeys.filter((key) => normalize(answers[key] || '') === normalize(blanks[key])).length;
  const contentParts = useMemo(() => exercise?.content.split(/(\{\{\d+\}\})/g) || [], [exercise]);

  const checkAnswers = async () => {
    setChecked(true);
    setSavedMessage(null);
    const token = await getAccessToken();
    if (!token || !exercise) {
      setSavedMessage('Bạn chưa đăng nhập, kết quả chỉ hiển thị tạm thời.');
      return;
    }
    const response = await fetch('/api/fill-blank-results', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ fillBlankId: exercise.id, score: Math.round((correctCount / blankKeys.length) * 10 * 10) / 10, totalBlanks: blankKeys.length, correctBlanks: correctCount }) });
    if (response.ok) setSavedMessage('Đã lưu kết quả vào hồ sơ của bạn.');
    else setSavedMessage('Không thể lưu kết quả, nhưng bạn vẫn có thể xem điểm.');
  };

  if (error) return <Layout title="Lỗi - Viên Chức 247"><div className="error-state"><p className="error-message">{error}</p></div></Layout>;
  if (!exercise) return <Layout title="Bài tập điền khuyết - Viên Chức 247"><div className="loading-state"><div className="spinner" /><p>Đang tải bài tập...</p></div></Layout>;
  return <Layout title={`${exercise.title} - Viên Chức 247`}><section className="fill-exercise-page"><button className="article-back fill-back" onClick={() => router.back()} type="button">← Quay lại</button><h1>{exercise.title}</h1><p className="fill-page-intro">Điền đáp án vào các ô trống trong đoạn văn bản dưới đây.</p><div className="fill-document">{contentParts.map((part, index) => { const match = part.match(/^\{\{(\d+)\}\}$/); if (!match) return <span key={index}>{part}</span>; const key = match[1]; const isCorrect = normalize(answers[key] || '') === normalize(blanks[key]); return <span className="fill-blank-wrap" key={index}><input aria-label={`Đáp án ô trống ${key}`} className={`fill-blank-input ${checked ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}`} value={answers[key] || ''} onChange={(event) => setAnswers({ ...answers, [key]: event.target.value })} /><b>{key}</b>{checked && !isCorrect && <small>Đáp án: {blanks[key]}</small>}</span>; })}</div><div className="fill-result-bar">{checked && <strong>Đúng {correctCount}/{blankKeys.length} · Điểm {Math.round((correctCount / blankKeys.length) * 10 * 10) / 10}/10</strong>}<button className="btn btn-primary" onClick={checkAnswers} type="button">{checked ? 'Chấm lại' : 'Nộp bài'}</button></div>{savedMessage && <p className="saving-text">{savedMessage}</p>}</section></Layout>;
};

export default FillInExercisePage;
