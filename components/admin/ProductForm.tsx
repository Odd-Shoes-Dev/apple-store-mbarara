import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Category, Product } from "../../server/domain/types";

type ImageDraft = { url: string; key: string };

type Props = {
  initial?: Product;
};

type CategoryRow = Category & { parentName: string | null };

const ProductForm = ({ initial }: Props) => {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? (initial.priceCents / 100).toString() : "");
  const [categoryId, setCategoryId] = useState<string>(initial?.category?.id ?? "");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [active, setActive] = useState(initial?.active ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [images, setImages] = useState<ImageDraft[]>(
    initial?.images.map((image) => ({ url: image.url, key: image.key })) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        const all: CategoryRow[] = data.categories ?? [];
        setCategories(all);
        if (!categoryId && all.length > 0) {
          setCategoryId((all.find((c) => !c.parentId) ?? all[0]).id);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departments = categories.filter((c) => !c.parentId);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploaded: ImageDraft[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/products/upload", { method: "POST", body: formData });
        if (!res.ok) {
          throw new Error("Upload failed");
        }
        const data = await res.json();
        uploaded.push({ url: data.url, key: data.key });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (key: string) => {
    setImages((prev) => prev.filter((image) => image.key !== key));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceCents = Math.round(parseFloat(price) * 100);
    if (Number.isNaN(priceCents) || priceCents <= 0) {
      setError("Enter a valid price");
      return;
    }

    setSaving(true);

    const body = {
      name,
      description,
      priceCents,
      currency: "usd",
      categoryId,
      active,
      isFeatured,
      images: images.map((image, index) => ({ ...image, position: index })),
    };

    const res = await fetch(isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Failed to save product");
      return;
    }

    router.push("/admin/products");
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
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {departments.map((department) => {
              const children = categories.filter((c) => c.parentId === department.id);
              return (
                <optgroup key={department.id} label={department.name}>
                  <option value={department.id}>All {department.name}</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active (visible on storefront)
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          Feature on homepage
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-1"
        />
        {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((image) => (
            <div key={image.key} className="relative">
              <img src={image.url} alt="" className="w-20 h-20 object-cover rounded border" />
              <button
                type="button"
                onClick={() => removeImage(image.key)}
                className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-5 h-5 text-xs leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="bg-slate-800 text-white rounded-md px-6 py-2 text-sm hover:bg-slate-900 disabled:opacity-50"
      >
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
      </button>
    </form>
  );
};

export default ProductForm;
