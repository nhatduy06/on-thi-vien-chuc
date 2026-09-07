import type { NextPage } from "next";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { Question } from "../../lib/mock";
import { readJson } from "../../lib/http";
import { CheckCircle2, Clock3, Lightbulb, XCircle } from "lucide-react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ResultView | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchQuestions = async () => {
    if (!subjectId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/questions?subjectId=" + subjectId);
      const json = await readJson(res);
      if (json.success) setQuestions(json.data);
      else setError(json.message || "Không thể tải câu hỏi");
    } catch {
      setError("Lỗi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) fetchQuestions();
  }, [subjectId]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, submitted]);

  const current = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;

  const selectAnswer = (option: string) =>
    setAnswers((prev) => ({ ...prev, [current.id]: option }));
  const goNext = () => {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };
  const goTo = (idx: number) => setCurrentIndex(idx);

  const handleSubmit = useCallback(async () => {
    const timeSpent = 900 - timeLeft;
    const correctList = questions.filter(
      (q) => answers[q.id] === q.correct_answer
    );
    const score =
      Math.round((correctList.length / total) * 10 * 10) / 10;
    const details = questions.map((q) => ({
      question: q,
      selected: answers[q.id] || "",
      isCorrect: answers[q.id] === q.correct_answer,
    }));
    setResult({
      score,
      total,
      correct: correctList.length,
      incorrect: total - correctList.length,
      timeSpent,
      details,
    });
    setSubmitted(true);
    setSaving(true);
    try {
      await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          score,
          totalQuestions: total,
          correctAnswers: correctList.length,
          answers,
          timeSpent,
        }),
      });
    } catch {
      // ignore save error
    } finally {
      setSaving(false);
    }
  }, [questions, answers, timeLeft, total, subjectId]);

  useEffect(() => {
    if (timeLeft <= 0 && !submitted) handleSubmit();
  }, [timeLeft, submitted, handleSubmit]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  if (loading)
    return (
      <Layout title="Đang tải... - Web ôn thi viên chức">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải câu hỏi...</p>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout title="Lỗi - Web ôn thi viên chức">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="btn btn-retry" onClick={fetchQuestions}>
            Thử lại
          </button>
        </div>
      </Layout>
    );

  if (submitted && result) {
    return (
      <Layout title="Kết quả - Web ôn thi viên chức">
        <div className="result-container">
          <div className="result-header">KẾT QUẢ BÀI THI</div>
          <div className="result-score-circle">
            <div className="score-number">{result.score}</div>
            <div className="score-label">/ 10</div>
          </div>
          <div className="result-stats">
            <div className="stat-item correct">
              <span className="stat-icon"><CheckCircle2 size={17} /></span>
              Đúng: {result.correct}
            </div>
            <div className="stat-item incorrect">
              <span className="stat-icon"><XCircle size={17} /></span>
              Sai: {result.incorrect}
            </div>
            <div className="stat-item">
              <span className="stat-icon"><Clock3 size={17} /></span>
              Thời gian: {formatTime(result.timeSpent)}
            </div>
          </div>
          {saving && <p className="saving-text">Đang lưu kết quả...</p>}
          {result.details.map((d, i) => (
            <div
              key={i}
              className={
                "review-card " + (d.isCorrect ? "correct" : "incorrect")
              }
            >
              <div className="review-question">
                Câu {i + 1}: {d.question.content}
              </div>
              <div className="review-answers">
                {(["A", "B", "C", "D"] as const).map((k) => {
                  const opt = d.question[
                    ("option_" + k.toLowerCase()) as keyof Question
                  ] as string;
                  const isSelected = d.selected === k;
                  const isCorrectOpt = d.question.correct_answer === k;
                  let cls = "";
                  if (isCorrectOpt) cls = "correct-answer";
                  else if (isSelected && !isCorrectOpt) cls = "wrong-answer";
                  return (
                    <div key={k} className={"review-option " + cls}>
                      <span className="rev-key">{k}</span>
                      {opt}
                    </div>
                  );
                })}
              </div>
              <div className="review-explanation">
                 <Lightbulb size={16} /> {d.question.explanation}
              </div>
            </div>
          ))}
          <button
            className="btn btn-back"
            onClick={() => router.push("/")}
          >
            Về trang chủ
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Làm bài thi - Web ôn thi viên chức">
      <div className="exam-container">
        <div className="exam-header">
          <div className="exam-progress-text">
            Câu {currentIndex + 1}/{total}
          </div>
          <div
            className={
              "exam-timer " + (timeLeft < 60 ? "timer-warning" : "")
            }
          >
             <Clock3 size={16} /> {formatTime(timeLeft)}
          </div>
          <div className="exam-answered">
            Đã làm: {answeredCount}/{total}
          </div>
        </div>

        <div className="exam-body">
          <div className="question-number-box">Câu {currentIndex + 1}</div>
          <div className="question-content">{current?.content}</div>
          <div className="options-list">
            {(["A", "B", "C", "D"] as const).map((key) => {
              const optionText = current?.[
                ("option_" + key.toLowerCase()) as keyof Question
              ] as string;
              const isSelected = answers[current?.id] === key;
              return (
                <div
                  key={key}
                  className={
                    "option-item " + (isSelected ? "selected" : "")
                  }
                  onClick={() => selectAnswer(key)}
                >
                  <span className="option-key">{key}</span>
                  <span className="option-text">{optionText}</span>
                  {isSelected && <span className="option-check">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="exam-footer">
          <button
            className="btn btn-nav"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            ← Quay lại
          </button>
          <button
            className="btn btn-submit"
            onClick={handleSubmit}
            disabled={answeredCount === 0}
          >
            Nộp bài
          </button>
          <button
            className="btn btn-nav"
            onClick={goNext}
            disabled={currentIndex === total - 1}
          >
            Tiếp theo →
          </button>
        </div>

        <div className="question-palette">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={
                "palette-item " +
                (answers[q.id] ? "answered " : "") +
                (i === currentIndex ? "active" : "")
              }
              onClick={() => goTo(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ExamPage;
