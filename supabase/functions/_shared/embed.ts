// Generates embeddings with Supabase's built-in gte-small model (384 dims).
// Runs only inside the Deno Edge Runtime — `Supabase.ai` is not available
// in Next.js server code, which is why query-time embedding also has to
// go through the embed-query function rather than running in the Route
// Handler directly.
// deno-lint-ignore no-explicit-any
declare const Supabase: any;

let session: unknown;

export async function embedText(text: string): Promise<number[]> {
  if (!session) {
    session = new Supabase.ai.Session("gte-small");
  }
  const embedding = await (session as { run: (text: string, opts: Record<string, boolean>) => Promise<number[]> }).run(
    text,
    { mean_pool: true, normalize: true }
  );
  return embedding;
}
