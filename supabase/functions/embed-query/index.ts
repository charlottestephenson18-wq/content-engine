// Embeds a single query string with the gte-small model, so the Next.js
// server (which can't run Supabase.ai itself) can get a vector to pass into
// the match_document_chunks RPC. Invoked only by our own server-side code
// via supabase.functions.invoke(), authenticated with the caller's own
// Supabase session/service-role key — not exposed to end users directly.
import { embedText } from "../_shared/embed.ts";

Deno.serve(async (req) => {
  try {
    const { text } = await req.json();

    if (typeof text !== "string" || !text.trim()) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const embedding = await embedText(text);

    return new Response(JSON.stringify({ embedding }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
