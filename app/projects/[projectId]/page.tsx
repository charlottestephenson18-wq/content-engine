import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/UploadForm";
import { DocumentList } from "@/components/DocumentList";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .single();

  if (!project) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, filename, status, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Link href="/dashboard" className="text-sm underline">
        &larr; Dashboard
      </Link>
      <h1 className="text-xl font-semibold">{project.name}</h1>
      <UploadForm projectId={project.id} />
      <DocumentList documents={documents ?? []} />
    </div>
  );
}
