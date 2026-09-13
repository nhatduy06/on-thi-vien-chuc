import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mockArticles, mockCategories, mockSubjects, mockQuestions, Article, Category, Subject, Question } from './mock';

export interface ExamResult {
  id: number;
  userId: string | null;
  answers?: Record<number, string>;
  subjectId: number;
  subjectName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
}

export interface ExamResultAnswer {
  id: number;
  resultId: number;
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface ResultReview {
  result: ExamResult;
  details: Array<{ question: Question; selected: string; isCorrect: boolean }>;
}

const CATEGORY_COLUMNS = 'id, name, slug, description, icon, display_order';
const SUBJECT_COLUMNS = 'id, category_id, name, slug, description, display_order';
const QUESTION_COLUMNS = 'id, subject_id, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty';
const ARTICLE_COLUMNS = 'id, title, excerpt, content, is_published, published_at, created_at, updated_at';

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export function isSupabaseAvailable(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function shouldUseFallback(): boolean {
  return !isSupabaseAvailable() || Boolean(process.env.JEST_WORKER_ID);
}

function throwIfError(error: { message?: string } | null): void {
  if (error) throw new Error(error.message || 'Supabase request failed');
}

// ===== In-memory fallback for tests and local development without Supabase =====
interface StoreState {
  categories: Category[];
  subjects: Subject[];
  questions: Question[];
  results: ExamResult[];
  resultAnswers: ExamResultAnswer[];
  nextCategoryId: number;
  nextSubjectId: number;
  nextQuestionId: number;
  nextResultId: number;
  nextResultAnswerId: number;
}

function getState(): StoreState {
  const g = globalThis as typeof globalThis & { __cmsStore?: StoreState };
  if (!g.__cmsStore) {
    g.__cmsStore = {
      categories: [...mockCategories],
      subjects: [...mockSubjects],
      questions: [...mockQuestions],
      results: [],
      resultAnswers: [],
      nextCategoryId: Math.max(...mockCategories.map((c) => c.id)) + 1,
      nextSubjectId: Math.max(...mockSubjects.map((s) => s.id)) + 1,
      nextQuestionId: Math.max(...mockQuestions.map((q) => q.id)) + 1,
      nextResultId: 1,
      nextResultAnswerId: 1,
    };
  }
  return g.__cmsStore;
}

function recomputeQuestionCounts(state: StoreState): void {
  for (const subject of state.subjects) {
    subject.question_count = state.questions.filter((question) => question.subject_id === subject.id).length;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function mapResult(row: Record<string, unknown>, subjectName = ''): ExamResult {
  return {
    id: Number(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    subjectId: Number(row.subject_id),
    subjectName,
    score: Number(row.score),
    totalQuestions: Number(row.total_questions),
    correctAnswers: Number(row.correct_answers),
    timeSpent: Number(row.time_spent),
    completedAt: String(row.completed_at),
  };
}

// ===== CATEGORIES =====
export async function listCategories(): Promise<Category[]> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db.from('categories').select(CATEGORY_COLUMNS).order('display_order', { ascending: true });
    throwIfError(error);
    return (data ?? []) as Category[];
  }

  return [...getState().categories].sort((a, b) => a.display_order - b.display_order);
}

export async function createCategory(input: Omit<Category, 'id'>): Promise<Category> {
  const slug = input.slug || slugify(input.name);
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db
      .from('categories')
      .insert({ name: input.name, slug, description: input.description || '', icon: input.icon || 'book-open', display_order: input.display_order ?? 1 })
      .select(CATEGORY_COLUMNS)
      .single();
    throwIfError(error);
    return data as Category;
  }

  const state = getState();
  const item: Category = {
    id: state.nextCategoryId++,
    name: input.name,
    slug,
    description: input.description || '',
    icon: input.icon || 'book-open',
    display_order: input.display_order ?? state.categories.length + 1,
  };
  state.categories.push(item);
  return item;
}

export async function updateCategory(id: number, input: Partial<Category>): Promise<Category | null> {
  const current = (await listCategories()).find((category) => category.id === id);
  if (!current) return null;
  const merged = { ...current, ...input, id, slug: input.slug || current.slug };
  const db = getSupabase();

  if (db && !shouldUseFallback()) {
    const { data, error } = await db
      .from('categories')
      .update({ name: merged.name, slug: merged.slug, description: merged.description ?? '', icon: merged.icon ?? 'book-open', display_order: merged.display_order ?? 1, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(CATEGORY_COLUMNS)
      .maybeSingle();
    throwIfError(error);
    return (data as Category | null) ?? null;
  }

  const state = getState();
  const index = state.categories.findIndex((category) => category.id === id);
  if (index === -1) return null;
  state.categories[index] = merged;
  return merged;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db.from('categories').delete().eq('id', id).select('id');
    throwIfError(error);
    return (data ?? []).length > 0;
  }

  const state = getState();
  const index = state.categories.findIndex((category) => category.id === id);
  if (index === -1) return false;
  const subjectIds = state.subjects.filter((subject) => subject.category_id === id).map((subject) => subject.id);
  state.questions = state.questions.filter((question) => !subjectIds.includes(question.subject_id));
  state.subjects = state.subjects.filter((subject) => subject.category_id !== id);
  state.categories.splice(index, 1);
  return true;
}

// ===== ARTICLES =====
export async function listArticles(includeUnpublished = false): Promise<Article[]> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    let query = db.from('articles').select(ARTICLE_COLUMNS).order('published_at', { ascending: false });
    if (!includeUnpublished) query = query.eq('is_published', true);
    const { data, error } = await query;
    throwIfError(error);
    return (data ?? []) as Article[];
  }

  return [...mockArticles]
    .filter((article) => includeUnpublished || article.is_published)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}

export async function createArticle(input: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<Article> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db.from('articles').insert(input).select(ARTICLE_COLUMNS).single();
    throwIfError(error);
    return data as Article;
  }

  const now = new Date().toISOString();
  const item: Article = { ...input, id: Math.max(0, ...mockArticles.map((article) => article.id)) + 1, created_at: now, updated_at: now };
  mockArticles.push(item);
  return item;
}

export async function updateArticle(id: number, input: Partial<Article>): Promise<Article | null> {
  const current = (await listArticles(true)).find((article) => article.id === id);
  if (!current) return null;
  const merged = { ...current, ...input, id, updated_at: new Date().toISOString() };
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db.from('articles').update({ title: merged.title, excerpt: merged.excerpt, content: merged.content, is_published: merged.is_published, published_at: merged.published_at, updated_at: merged.updated_at }).eq('id', id).select(ARTICLE_COLUMNS).maybeSingle();
    throwIfError(error);
    return (data as Article | null) ?? null;
  }

  const index = mockArticles.findIndex((article) => article.id === id);
  if (index === -1) return null;
  mockArticles[index] = merged;
  return merged;
}

export async function deleteArticle(id: number): Promise<boolean> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db.from('articles').delete().eq('id', id).select('id');
    throwIfError(error);
    return (data ?? []).length > 0;
  }

  const index = mockArticles.findIndex((article) => article.id === id);
  if (index === -1) return false;
  mockArticles.splice(index, 1);
  return true;
}

// ===== SUBJECTS =====
export async function listSubjects(categoryId?: number): Promise<Subject[]> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    let query = db
      .from('subjects')
      .select(`${SUBJECT_COLUMNS}, questions(count)`)
      .order('display_order', { ascending: true });
    if (categoryId !== undefined) query = query.eq('category_id', categoryId);
    const { data, error } = await query;
    throwIfError(error);
    return ((data ?? []) as Array<Record<string, unknown>>).map((subject) => {
      const questions = subject.questions as Array<{ count: number }> | undefined;
      return { ...subject, question_count: questions?.[0]?.count ?? 0 } as unknown as Subject;
    });
  }

  const state = getState();
  recomputeQuestionCounts(state);
  let items = [...state.subjects];
  if (categoryId !== undefined) items = items.filter((subject) => subject.category_id === categoryId);
  return items.sort((a, b) => a.display_order - b.display_order);
}

export async function createSubject(input: Omit<Subject, 'id' | 'question_count'>): Promise<Subject> {
  const slug = input.slug || slugify(input.name);
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db
      .from('subjects')
      .insert({ category_id: input.category_id, name: input.name, slug, description: input.description || '', display_order: input.display_order ?? 1 })
      .select(SUBJECT_COLUMNS)
      .single();
    throwIfError(error);
    return { ...(data as Subject), question_count: 0 };
  }

  const state = getState();
  const item: Subject = {
    id: state.nextSubjectId++,
    category_id: input.category_id,
    name: input.name,
    slug,
    description: input.description || '',
    display_order: input.display_order ?? state.subjects.length + 1,
    question_count: 0,
  };
  state.subjects.push(item);
  return item;
}

export async function updateSubject(id: number, input: Partial<Subject>): Promise<Subject | null> {
  const current = (await listSubjects()).find((subject) => subject.id === id);
  if (!current) return null;
  const merged = { ...current, ...input, id, slug: input.slug || current.slug, question_count: current.question_count };
  const db = getSupabase();

  if (db && !shouldUseFallback()) {
    const { data, error } = await db
      .from('subjects')
      .update({ category_id: merged.category_id, name: merged.name, slug: merged.slug, description: merged.description ?? '', display_order: merged.display_order ?? 1, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(SUBJECT_COLUMNS)
      .maybeSingle();
    throwIfError(error);
    return data ? { ...(data as Subject), question_count: current.question_count } : null;
  }

  const state = getState();
  const index = state.subjects.findIndex((subject) => subject.id === id);
  if (index === -1) return null;
  state.subjects[index] = merged;
  return merged;
}

export async function deleteSubject(id: number): Promise<boolean> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db.from('subjects').delete().eq('id', id).select('id');
    throwIfError(error);
    return (data ?? []).length > 0;
  }

  const state = getState();
  const index = state.subjects.findIndex((subject) => subject.id === id);
  if (index === -1) return false;
  state.questions = state.questions.filter((question) => question.subject_id !== id);
  state.subjects.splice(index, 1);
  return true;
}

// ===== QUESTIONS =====
export async function listQuestions(subjectId?: number): Promise<Question[]> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    let query = db.from('questions').select(QUESTION_COLUMNS).order('id', { ascending: true });
    if (subjectId !== undefined) query = query.eq('subject_id', subjectId);
    const { data, error } = await query;
    throwIfError(error);
    return (data ?? []) as Question[];
  }

  let items = [...getState().questions];
  if (subjectId !== undefined) items = items.filter((question) => question.subject_id === subjectId);
  return items;
}

export async function createQuestion(input: Omit<Question, 'id'>): Promise<Question> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db.from('questions').insert(input).select(QUESTION_COLUMNS).single();
    throwIfError(error);
    return data as Question;
  }

  const state = getState();
  const item: Question = { ...input, id: state.nextQuestionId++ };
  state.questions.push(item);
  recomputeQuestionCounts(state);
  return item;
}

export async function updateQuestion(id: number, input: Partial<Question>): Promise<Question | null> {
  const current = (await listQuestions()).find((question) => question.id === id);
  if (!current) return null;
  const merged = { ...current, ...input, id } as Question;
  const db = getSupabase();

  if (db && !shouldUseFallback()) {
    const { data, error } = await db
      .from('questions')
      .update({ ...merged, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(QUESTION_COLUMNS)
      .maybeSingle();
    throwIfError(error);
    return (data as Question | null) ?? null;
  }

  const state = getState();
  const index = state.questions.findIndex((question) => question.id === id);
  if (index === -1) return null;
  state.questions[index] = merged;
  recomputeQuestionCounts(state);
  return merged;
}

export async function deleteQuestion(id: number): Promise<boolean> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db.from('questions').delete().eq('id', id).select('id');
    throwIfError(error);
    return (data ?? []).length > 0;
  }

  const state = getState();
  const index = state.questions.findIndex((question) => question.id === id);
  if (index === -1) return false;
  state.questions.splice(index, 1);
  recomputeQuestionCounts(state);
  return true;
}

// ===== RESULTS =====
export async function listResults(): Promise<ExamResult[]> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db
      .from('exam_results')
        .select('id, user_id, subject_id, score, total_questions, correct_answers, time_spent, completed_at, subjects(name)')
      .order('id', { ascending: false });
    throwIfError(error);
    return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
      const relation = row.subjects as { name?: string } | Array<{ name?: string }> | null;
      const subject = Array.isArray(relation) ? relation[0] : relation;
      return mapResult(row, subject?.name || '');
    });
  }

  return [...getState().results].sort((a, b) => b.id - a.id);
}

export async function listResultsByUser(userId: string): Promise<ExamResult[]> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db
      .from('exam_results')
      .select('id, user_id, subject_id, score, total_questions, correct_answers, time_spent, completed_at, subjects(name)')
      .eq('user_id', userId)
      .order('id', { ascending: false });
    throwIfError(error);
    return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
      const relation = row.subjects as { name?: string } | Array<{ name?: string }> | null;
      const subject = Array.isArray(relation) ? relation[0] : relation;
      return mapResult(row, subject?.name || '');
    });
  }
  return (await listResults()).filter((result) => result.userId === userId);
}

export async function createResult(input: Omit<ExamResult, 'id' | 'completedAt' | 'subjectName'> & { userId: string }): Promise<ExamResult> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db
      .from('exam_results')
        .insert({ user_id: input.userId, subject_id: input.subjectId, score: input.score, total_questions: input.totalQuestions, correct_answers: input.correctAnswers, time_spent: input.timeSpent })
        .select('id, user_id, subject_id, score, total_questions, correct_answers, time_spent, completed_at')
      .single();
    throwIfError(error);

    const answerEntries = Object.entries(input.answers || {});
    if (answerEntries.length > 0) {
      const questionIds = answerEntries.map(([questionId]) => Number(questionId)).filter(Number.isInteger);
      const { data: questionRows, error: questionError } = await db
        .from('questions')
        .select('id, correct_answer')
        .eq('subject_id', input.subjectId)
        .in('id', questionIds);
      throwIfError(questionError);
      const correctById = new Map((questionRows ?? []).map((question) => [Number(question.id), String(question.correct_answer)]));
      const answerRows = answerEntries
        .map(([questionId, selectedAnswer]) => {
          const id = Number(questionId);
          const correctAnswer = correctById.get(id);
          if (!correctAnswer || !selectedAnswer) return null;
          return { result_id: Number((data as Record<string, unknown>).id), question_id: id, selected_answer: selectedAnswer, is_correct: selectedAnswer === correctAnswer };
        })
        .filter((answer): answer is { result_id: number; question_id: number; selected_answer: string; is_correct: boolean } => Boolean(answer));
      if (answerRows.length > 0) {
        const { error: answerError } = await db.from('exam_result_answers').insert(answerRows);
        throwIfError(answerError);
      }
    }

    const { data: subject, error: subjectError } = await db.from('subjects').select('name').eq('id', input.subjectId).maybeSingle();
    throwIfError(subjectError);
    return mapResult(data as Record<string, unknown>, (subject as { name?: string } | null)?.name || '');
  }

  const state = getState();
  const subject = state.subjects.find((item) => item.id === input.subjectId);
  const item: ExamResult = {
    ...input,
    subjectName: subject ? subject.name : `Chủ đề #${input.subjectId}`,
    id: state.nextResultId++,
    completedAt: new Date().toISOString(),
  };
  state.results.push(item);
  const questionById = new Map(state.questions.filter((question) => question.subject_id === input.subjectId).map((question) => [question.id, question]));
  for (const [questionId, selectedAnswer] of Object.entries(input.answers || {})) {
    const question = questionById.get(Number(questionId));
    if (!question || !selectedAnswer) continue;
    state.resultAnswers.push({ id: state.nextResultAnswerId++, resultId: item.id, questionId: question.id, selectedAnswer, isCorrect: selectedAnswer === question.correct_answer });
  }
  return item;
}

export async function listResultAnswers(): Promise<ExamResultAnswer[]> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db.from('exam_result_answers').select('id, result_id, question_id, selected_answer, is_correct');
    throwIfError(error);
    return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({ id: Number(row.id), resultId: Number(row.result_id), questionId: Number(row.question_id), selectedAnswer: String(row.selected_answer), isCorrect: Boolean(row.is_correct) }));
  }
  return [...getState().resultAnswers];
}

export async function getResultReview(userId: string, resultId: number): Promise<ResultReview | null> {
  const result = (await listResultsByUser(userId)).find((item) => item.id === resultId);
  if (!result) return null;
  const [questions, answers] = await Promise.all([listQuestions(result.subjectId), listResultAnswers()]);
  const answersByQuestion = new Map(answers.filter((answer) => answer.resultId === resultId).map((answer) => [answer.questionId, answer]));
  return {
    result,
    details: questions.map((question) => {
      const answer = answersByQuestion.get(question.id);
      return { question, selected: answer?.selectedAnswer || '', isCorrect: Boolean(answer?.isCorrect) };
    }),
  };
}

// ===== STATS (dashboard) =====
export async function getStats() {
  const [categories, subjects, questions, results, resultAnswers] = await Promise.all([
    listCategories(),
    listSubjects(),
    listQuestions(),
    listResults(),
    listResultAnswers(),
  ]);
  const totalResults = results.length;
  const avgScore = totalResults > 0
    ? Math.round((results.reduce((sum, result) => sum + result.score, 0) / totalResults) * 10) / 10
    : 0;
  const subjectStats = subjects.map((subject) => {
    const subjectResults = results.filter((result) => result.subjectId === subject.id);
    const subjectAverage = subjectResults.length > 0 ? subjectResults.reduce((sum, result) => sum + result.score, 0) / subjectResults.length : 0;
    const subjectCorrect = subjectResults.reduce((sum, result) => sum + result.correctAnswers, 0);
    const subjectTotal = subjectResults.reduce((sum, result) => sum + result.totalQuestions, 0);
    return { subjectId: subject.id, subjectName: subject.name, attempts: subjectResults.length, avgScore: Math.round(subjectAverage * 10) / 10, accuracy: subjectTotal > 0 ? Math.round((subjectCorrect / subjectTotal) * 100) : 0 };
  }).filter((subject) => subject.attempts > 0).sort((a, b) => b.attempts - a.attempts);

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const missedMap = new Map<number, { attempts: number; wrong: number }>();
  for (const answer of resultAnswers) {
    const current = missedMap.get(answer.questionId) || { attempts: 0, wrong: 0 };
    current.attempts += 1;
    if (!answer.isCorrect) current.wrong += 1;
    missedMap.set(answer.questionId, current);
  }
  const mostMissedQuestions = [...missedMap.entries()]
    .map(([questionId, stats]) => {
      const question = questionMap.get(questionId);
      const subject = subjects.find((item) => item.id === question?.subject_id);
      return { questionId, content: question?.content || `Câu hỏi #${questionId}`, subjectName: subject?.name || 'Không xác định', attempts: stats.attempts, wrongAnswers: stats.wrong, wrongRate: Math.round((stats.wrong / stats.attempts) * 100) };
    })
    .sort((a, b) => b.wrongAnswers - a.wrongAnswers || b.wrongRate - a.wrongRate)
    .slice(0, 10);

  const dayMap = new Map<string, { attempts: number; scoreTotal: number }>();
  for (const result of results) {
    const date = result.completedAt.slice(0, 10);
    const current = dayMap.get(date) || { attempts: 0, scoreTotal: 0 };
    current.attempts += 1;
    current.scoreTotal += result.score;
    dayMap.set(date, current);
  }
  const attemptsByDay = [...dayMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([date, stats]) => ({ date, attempts: stats.attempts, avgScore: Math.round((stats.scoreTotal / stats.attempts) * 10) / 10 }));

  return {
    categories: categories.length,
    subjects: subjects.length,
    questions: questions.length,
    results: totalResults,
    avgScore,
    attemptsByDay,
    subjectStats,
    mostMissedQuestions,
    trackedAnswers: resultAnswers.length,
  };
}
