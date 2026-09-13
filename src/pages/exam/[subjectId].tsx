import type { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { Question } from '../../lib/mock';
import { readJson } from '../../lib/http';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';
import { CheckCircle2, Clock3, Lightbulb, XCircle } from 'lucide-react';

const PAGE_SIZE = 10;
const OPTIONS = ['A', 'B', 'C', 'D'] as const;

interface ResultView {
  score: number;
  total: number;
  correct: number;
  incorrect: number;
  timeSpent: number;
  details: { question: Question; selected: string; isCorrect: boolean }[];
}

const ExamPage: NextPage = () => {
  const router = useRouter();
  const { subjectId } = router.query;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ResultView | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!subjectId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/questions?subjectId=${subjectId}`);
      const json = await readJson(res);
      if (json.success) setQuestions(json.data);
      else setError(json.message || 'Không thể tải câu hỏi');
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) fetchQuestions();
  }, [subjectId]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const total = questions.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageQuestions = questions.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const answeredCount = Object.keys(answers).length;

  const selectAnswer = (questionId: number, option: string) => {
    setAnswers((previous) => ({ ...previous, [questionId]: option }));
  };

  const goToQuestion = (index: number) => {
    const page = Math.floor(index / PAGE_SIZE);
    setCurrentPage(page);
    window.setTimeout(() => document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const handleSubmit = useCallback(async () => {
    if (!total) return;
    const timeSpent = 900 - timeLeft;
    const correctList = questions.filter((question) => answers[question.id] === question.correct_answer);
    const score = Math.round((correctList.length / total) * 10 * 10) / 10;
    const details = questions.map((question) => ({ question, selected: answers[question.id] || '', isCorrect: answers[question.id] === question.correct_answer }));
    setResult({ score, total, correct: correctList.length, incorrect: total - correctList.length, timeSpent, details });
    setSubmitted(true);
    setSaveMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setSaveMessage('Bạn chưa đăng nhập, kết quả chỉ hiển thị tạm thời.');
        return;
      }
      setSaving(true);
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ subjectId, score, totalQuestions: total, correctAnswers: correctList.length, answers, timeSpent }),
      });
      if (!response.ok) setSaveMessage('Không thể lưu kết quả. Vui lòng thử lại sau.');
    } catch {
      setSaveMessage('Không thể lưu kết quả. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
    }
  }, [questions, answers, timeLeft, total, subjectId]);

  useEffect(() => {
    if (timeLeft <= 0 && !submitted) handleSubmit();
  }, [timeLeft, submitted, handleSubmit]);

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (loading) return <Layout title="Đang tải... - Viên Chức 247"><div className="loading-state"><div className="spinner" /><p>Đang tải câu hỏi...</p></div></Layout>;
  if (error) return <Layout title="Lỗi - Viên Chức 247"><div className="error-state"><p className="error-message">{error}</p><button className="btn btn-retry" onClick={fetchQuestions} type="button">Thử lại</button></div></Layout>;

  if (submitted && result) return (
    <Layout title="Kết quả - Viên Chức 247">
      <div className="result-container">
        <div className="result-header">KẾT QUẢ BÀI THI</div>
        <div className="result-score-circle"><div className="score-number">{result.score}</div><div className="score-label">/ 10</div></div>
        <div className="result-stats"><div className="stat-item correct"><span className="stat-icon"><CheckCircle2 size={17} /></span>Đúng: {result.correct}</div><div className="stat-item incorrect"><span className="stat-icon"><XCircle size={17} /></span>Sai: {result.incorrect}</div><div className="stat-item"><span className="stat-icon"><Clock3 size={17} /></span>Thời gian: {formatTime(result.timeSpent)}</div></div>
        {saving && <p className="saving-text">Đang lưu kết quả...</p>}
        {saveMessage && <p className="saving-text">{saveMessage}</p>}
        {result.details.map((detail, index) => <div key={detail.question.id} className={`review-card ${detail.isCorrect ? 'correct' : 'incorrect'}`}><div className="review-question">Câu {index + 1}: {detail.question.content}</div><div className="review-answers">{OPTIONS.map((key) => { const option = detail.question[`option_${key.toLowerCase()}` as keyof Question] as string; const isSelected = detail.selected === key; const isCorrect = detail.question.correct_answer === key; const className = isCorrect ? 'correct-answer' : isSelected ? 'wrong-answer' : ''; return <div key={key} className={`review-option ${className}`}><span className="rev-key">{key}</span>{option}</div>; })}</div><div className="review-explanation"><Lightbulb size={16} /> {detail.question.explanation}</div></div>)}
        <button className="btn btn-back" onClick={() => router.push('/')} type="button">Về trang chủ</button>
      </div>
    </Layout>
  );

  return (
    <Layout title="Làm bài thi - Viên Chức 247">
      <div className="exam-container">
        <div className="exam-header"><div className="exam-progress-text">Trang {currentPage + 1}/{pageCount}</div><div className={`exam-timer ${timeLeft < 60 ? 'timer-warning' : ''}`}><Clock3 size={16} /> {formatTime(timeLeft)}</div><div className="exam-answered">Đã làm: {answeredCount}/{total}</div></div>
        <div className="exam-layout">
          <main className="exam-main">
            <div className="exam-page-heading"><h1>Bài thi trắc nghiệm</h1><p>Trang này gồm câu {currentPage * PAGE_SIZE + 1} đến {Math.min((currentPage + 1) * PAGE_SIZE, total)}.</p></div>
            <div className="exam-question-list">{pageQuestions.map((question, pageIndex) => { const index = currentPage * PAGE_SIZE + pageIndex; return <article className="exam-question-card" id={`question-${index}`} key={question.id}><div className="question-card-heading"><span className="question-number-box">Câu {index + 1}</span>{answers[question.id] && <span className="question-done"><CheckCircle2 size={15} /> Đã trả lời</span>}</div><h2 className="question-content">{question.content}</h2><div className="options-list">{OPTIONS.map((key) => { const optionText = question[`option_${key.toLowerCase()}` as keyof Question] as string; const isSelected = answers[question.id] === key; return <button key={key} className={`option-item ${isSelected ? 'selected' : ''}`} onClick={() => selectAnswer(question.id, key)} type="button"><span className="option-key">{key}</span><span className="option-text">{optionText}</span>{isSelected && <span className="option-check">✓</span>}</button>; })}</div></article>; })}</div>
            <div className="exam-page-footer"><button className="btn btn-nav" onClick={() => setCurrentPage((page) => Math.max(0, page - 1))} disabled={currentPage === 0} type="button">← Trang trước</button><span>Trang {currentPage + 1} / {pageCount}</span><button className="btn btn-nav" onClick={() => setCurrentPage((page) => Math.min(pageCount - 1, page + 1))} disabled={currentPage === pageCount - 1} type="button">Trang sau →</button><button className="btn btn-submit" onClick={handleSubmit} disabled={answeredCount === 0} type="button">Nộp bài</button></div>
          </main>
          <aside className="question-sidebar" aria-label="Danh sách câu hỏi"><h2>Danh sách câu hỏi</h2><p>Nhấp vào số câu để chuyển nhanh.</p><div className="question-sidebar-grid">{questions.map((question, index) => <button key={question.id} className={`sidebar-question ${answers[question.id] ? 'answered' : ''} ${Math.floor(index / PAGE_SIZE) === currentPage ? 'page-active' : ''}`} onClick={() => goToQuestion(index)} type="button">{index + 1}</button>)}</div><div className="question-sidebar-legend"><span><i className="answered" /> Đã làm</span><span><i /> Chưa làm</span></div></aside>
        </div>
      </div>
    </Layout>
  );
};

export default ExamPage;
