import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Category } from "../../server/domain/types";

type Props = {
  initial?: Category;
};

const CategoryForm = ({ initial }: Props) => {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [parentId, setParentId] = useState<string>(initial?.parentId ?? "");
  const [departments, setDepartments] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        const all: Category[] = data.categories ?? [];
        setDepartments(all.filter((c) => !c.parentId && c.id !== initial?.id));
      });
  }, [initial?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const body = { name, parentId: parentId || null };

    const res = await fetch(isEdit ? `/api/admin/categories/${initial!.id}` : "/api/admin/categories", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Failed to save category");
      return;
    }

    router.push("/admin/categories");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5 max-w-xl">
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Parent</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">— (top-level department)</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Leave blank to create a department (e.g. &ldquo;iPhone&rdquo;); pick a department to
          create a model under it (e.g. &ldquo;iPhone 14&rdquo; under &ldquo;iPhone&rdquo;).
        </p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-slate-800 text-white rounded-md px-6 py-2 text-sm hover:bg-slate-900 disabled:opacity-50"
      >
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create category"}
      </button>
    </form>
  );
};

export default CategoryForm;
