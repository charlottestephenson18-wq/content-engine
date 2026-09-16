import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm underline">
            Log out
          </button>
        </form>
      </div>
      <p className="text-sm text-gray-600">Signed in as {user.email}</p>

      <Link
        href="/general"
        className="w-fit rounded border px-3 py-2 text-sm"
      >
        General data (brand guidelines, etc.)
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Projects</h2>
          <Link
            href="/dashboard/new-project"
            className="rounded bg-black px-3 py-1.5 text-sm text-white"
          >
            New project
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="block rounded border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {project.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
