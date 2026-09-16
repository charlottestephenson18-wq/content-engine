"use client";

import { useRouter } from "next/navigation";

type Document = {
  id: string;
  filename: string;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  chunking: "Processing...",
  embedded: "Ready",
  failed: "Failed",
};

export function DocumentList({ documents }: { documents: Document[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  if (documents.length === 0) {
    return <p className="text-sm text-gray-500">No documents uploaded yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between rounded border px-3 py-2 text-sm"
        >
          <span>{doc.filename}</span>
          <div className="flex items-center gap-3">
            <span className="text-gray-500">
              {STATUS_LABEL[doc.status] ?? doc.status}
            </span>
            <button
              onClick={() => handleDelete(doc.id)}
              className="text-red-600 underline"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
