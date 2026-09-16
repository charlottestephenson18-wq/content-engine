// Recursive character splitting: ~2000 chars (~500 tokens) per chunk, with
// ~200 chars (~50 tokens) of overlap so context isn't lost at chunk edges.
export function chunkText(
  text: string,
  { chunkSize = 2000, overlap = 200 }: { chunkSize?: number; overlap?: number } = {}
): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    let boundary = end;

    if (end < normalized.length) {
      const lastBreak = normalized.lastIndexOf("\n\n", end);
      if (lastBreak > start + chunkSize / 2) {
        boundary = lastBreak;
      }
    }

    const chunk = normalized.slice(start, boundary).trim();
    if (chunk) chunks.push(chunk);

    if (boundary >= normalized.length) break;
    start = boundary - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
}
