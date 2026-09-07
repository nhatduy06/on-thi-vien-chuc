// Data access layer for the public pages.
// - On Vercel (Supabase credentials present): database queries
// - Local tests/dev without credentials: in-memory store fallback
import { Category, Subject } from './mock';
import { listCategories, listSubjects } from './store';

export { isSupabaseAvailable } from './store';

export async function getCategories(): Promise<Category[]> {
  return listCategories();
}

export async function getSubjects(categoryId?: number): Promise<Subject[]> {
  return listSubjects(categoryId);
}
