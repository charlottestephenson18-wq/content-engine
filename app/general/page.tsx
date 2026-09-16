import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/UploadForm";
import { DocumentList } from "@/components/DocumentList";

export default async function GeneralPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: documents } = await supabase
    .from("documents")
    .select("id, filename, status, created_at")
    .is("project_id", null)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Link href="/dashboard" className="text-sm underline">
        &larr; Dashboard
      </Link>
      <div>
        <h1 className="text-xl font-semibold">General data</h1>
        <p className="text-sm text-gray-600">
          Context that applies across every project (e.g. brand guidelines).
        </p>
      </div>
      <UploadForm />
      <DocumentList documents={documents ?? []} />
    </div>
  );
}
