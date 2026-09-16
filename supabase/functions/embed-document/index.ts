// Chunks + embeds an uploaded document, invoked by the Next.js upload route
// right after a file lands in Storage. Runs with the service-role key
// (bypasses RLS by design) because it acts on a document_id chosen by
// trusted server-side code, not directly by end users.
import { createClient } from "@supabase/supabase-js";
import { chunkText } from "../_shared/chunk.ts";
import { embedText } from "../_shared/embed.ts";

const SUPPORTED_EXTENSIONS = ["txt", "md"];

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let documentId: string | undefined;

  try {
    const body = await req.json();
    documentId = body.document_id;

    if (!documentId) {
      return new Response(JSON.stringify({ error: "document_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("id, user_id, project_id, storage_path, filename")
      .eq("id", documentId)
      .single();

    if (fetchError || !document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const extension = document.filename.split(".").pop()?.toLowerCase();
    if (!extension || !SUPPORTED_EXTENSIONS.includes(extension)) {
      throw new Error(
        `Unsupported file type ".${extension}" — only ${SUPPORTED_EXTENSIONS.join(", ")} are supported in this version`
      );
    }

    await supabase
      .from("documents")
      .update({ status: "chunking" })
      .eq("id", documentId);

    const { data: file, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.storage_path);

    if (downloadError || !file) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    const text = await file.text();
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new Error("Document contained no extractable text");
    }

    const rows = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i]);
      rows.push({
        document_id: document.id,
        user_id: document.user_id,
        project_id: document.project_id,
        chunk_text: chunks[i],
        embedding,
        chunk_index: i,
      });
    }

    const { error: insertError } = await supabase
      .from("document_chunks")
      .insert(rows);

    if (insertError) {
      throw new Error(`Failed to insert chunks: ${insertError.message}`);
    }

    await supabase
      .from("documents")
      .update({ status: "embedded" })
      .eq("id", documentId);

    return new Response(
      JSON.stringify({ document_id: documentId, chunks: rows.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);

    if (documentId) {
      await supabase
        .from("documents")
        .update({ status: "failed" })
        .eq("id", documentId);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
