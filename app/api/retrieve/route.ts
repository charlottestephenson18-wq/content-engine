import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// This is the seam the future content-generation phase (research/draft/
// repurpose) will call before invoking Claude, so generated output stays
// grounded in the user's own uploaded context.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query, scope } = await request.json();

  if (typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const generalOnly = scope === "general" || !scope;
  const projectId =
    scope && typeof scope === "object" && typeof scope.project_id === "string"
      ? scope.project_id
      : null;

  const { data: embedData, error: embedError } = await supabase.functions.invoke(
    "embed-query",
    { body: { text: query } }
  );

  if (embedError) {
    return NextResponse.json({ error: embedError.message }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: embedData.embedding,
    match_user_id: user.id,
    match_project_id: projectId,
    match_general_only: generalOnly,
    match_count: 8,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ matches: data });
}
