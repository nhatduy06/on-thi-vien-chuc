import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mockCategories, mockSubjects, mockQuestions, Category, Subject, Question } from './mock';

export interface ExamResult {
  id: number;
  subjectId: number;
  subjectName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
}

const CATEGORY_COLUMNS = 'id, name, slug, description, icon, display_order';
const SUBJECT_COLUMNS = 'id, category_id, name, slug, description, display_order';
const QUESTION_COLUMNS = 'id, subject_id, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty';

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
  nextCategoryId: number;
  nextSubjectId: number;
  nextQuestionId: number;
  nextResultId: number;
}

function getState(): StoreState {
  const g = globalThis as typeof globalThis & { __cmsStore?: StoreState };
  if (!g.__cmsStore) {
    g.__cmsStore = {
      categories: [...mockCategories],
      subjects: [...mockSubjects],
      questions: [...mockQuestions],
      results: [],
      nextCategoryId: Math.max(...mockCategories.map((c) => c.id)) + 1,
      nextSubjectId: Math.max(...mockSubjects.map((s) => s.id)) + 1,
      nextQuestionId: Math.max(...mockQuestions.map((q) => q.id)) + 1,
      nextResultId: 1,
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
      .select('id, subject_id, score, total_questions, correct_answers, time_spent, completed_at, subjects(name)')
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

export async function createResult(input: Omit<ExamResult, 'id' | 'completedAt' | 'subjectName'>): Promise<ExamResult> {
  const db = getSupabase();
  if (db && !shouldUseFallback()) {
    const { data, error } = await db
      .from('exam_results')
      .insert({ subject_id: input.subjectId, score: input.score, total_questions: input.totalQuestions, correct_answers: input.correctAnswers, time_spent: input.timeSpent })
      .select('id, subject_id, score, total_questions, correct_answers, time_spent, completed_at')
      .single();
    throwIfError(error);

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
  return item;
}

// ===== STATS (dashboard) =====
export async function getStats() {
  const [categories, subjects, questions, results] = await Promise.all([
    listCategories(),
    listSubjects(),
    listQuestions(),
    listResults(),
  ]);
  const totalResults = results.length;
  const avgScore = totalResults > 0
    ? Math.round((results.reduce((sum, result) => sum + result.score, 0) / totalResults) * 10) / 10
    : 0;
  return {
    categories: categories.length,
    subjects: subjects.length,
    questions: questions.length,
    results: totalResults,
    avgScore,
  };
}
