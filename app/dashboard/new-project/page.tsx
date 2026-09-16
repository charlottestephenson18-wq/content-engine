"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create project");
      return;
    }

    const project = await res.json();
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Link href="/dashboard" className="text-sm underline">
        &larr; Dashboard
      </Link>
      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
        <h1 className="text-xl font-semibold">New project</h1>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create project"}
        </button>
      </form>
    </div>
  );
}
