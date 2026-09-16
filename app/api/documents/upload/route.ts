import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const projectId = formData.get("project_id");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const projectIdValue =
    typeof projectId === "string" && projectId.trim() ? projectId : null;

  if (projectIdValue) {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectIdValue)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const pathSegment = projectIdValue ?? "general";
  const storagePath = `${user.id}/${pathSegment}/${randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: document, error: insertError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      project_id: projectIdValue,
      storage_path: storagePath,
      filename: file.name,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Fire-and-forget: the UI polls document status rather than waiting on
  // full embedding completion here.
  supabase.functions
    .invoke("embed-document", { body: { document_id: document.id } })
    .catch((error) => console.error("embed-document invoke failed", error));

  return NextResponse.json(document, { status: 201 });
}
