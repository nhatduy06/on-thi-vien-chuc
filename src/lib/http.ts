export async function readJson<T = any>(response: Response): Promise<T> {
  return (await response.json()) as T;
}
