import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Category, CONDITION_LABELS, Product, ProductCondition, ProductSpec } from "../../server/domain/types";

type ImageDraft = { url: string; key: string };

type Props = {
  initial?: Product;
};

type CategoryRow = Category & { parentName: string | null };

const CONDITIONS: ProductCondition[] = ["brand_new", "used_uk", "used_local", "refurbished"];

const ProductForm = ({ initial }: Props) => {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? (initial.priceCents / 100).toString() : "");
  const [originalPrice, setOriginalPrice] = useState(
    initial?.originalPriceCents ? (initial.originalPriceCents / 100).toString() : ""
  );
  const [categoryId, setCategoryId] = useState<string>(initial?.category?.id ?? "");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [active, setActive] = useState(initial?.active ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initial?.isNewArrival ?? false);
  const [condition, setCondition] = useState<ProductCondition>(initial?.condition ?? "brand_new");
  const [stockCount, setStockCount] = useState(initial?.stockCount?.toString() ?? "0");
  const [warrantyMonths, setWarrantyMonths] = useState(
    initial?.warrantyMonths?.toString() ?? ""
  );
  const [isAuthentic, setIsAuthentic] = useState(initial?.isAuthentic ?? true);
  const [images, setImages] = useState<ImageDraft[]>(
    initial?.images.map((image) => ({ url: image.url, key: image.key })) ?? []
  );
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([]);
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
    if (isEdit && initial?.id) {
      fetch(`/api/admin/specs/${initial.id}`)
        .then((r) => r.json())
        .then((d) => setSpecs((d.specs as ProductSpec[] ?? []).map((s) => ({ label: s.label, value: s.value }))));
    }
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

    const originalPriceCents = originalPrice
      ? Math.round(parseFloat(originalPrice) * 100)
      : null;
    if (originalPrice && (Number.isNaN(originalPriceCents) || (originalPriceCents ?? 0) <= 0)) {
      setError("Enter a valid original price or leave it blank");
      return;
    }

    const stock = parseInt(stockCount, 10);
    if (Number.isNaN(stock) || stock < 0) {
      setError("Stock count must be 0 or more");
      return;
    }

    const warranty = warrantyMonths ? parseInt(warrantyMonths, 10) : null;
    if (warrantyMonths && (Number.isNaN(warranty) || (warranty ?? 0) <= 0)) {
      setError("Warranty months must be a positive number or leave it blank");
      return;
    }

    setSaving(true);

    const body = {
      name,
      description,
      priceCents,
      originalPriceCents,
      currency: "usd",
      categoryId,
      active,
      isFeatured,
      isNewArrival,
      condition,
      stockCount: stock,
      warrantyMonths: warranty,
      isAuthentic,
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

    const saved = await res.json();
    const productId = saved.product?.id ?? initial?.id;

    if (productId && specs.length > 0) {
      await fetch(`/api/admin/specs/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(specs.filter((s) => s.label && s.value).map((s, i) => ({ ...s, position: i }))),
      });
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
          <label className="block text-sm font-medium text-gray-700">Original Price (before discount)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Leave blank if no discount"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div className="flex gap-4">
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
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as ProductCondition)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Stock Count</label>
          <input
            type="number"
            min="0"
            step="1"
            value={stockCount}
            onChange={(e) => setStockCount(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Warranty (months)</label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Leave blank if none"
            value={warrantyMonths}
            onChange={(e) => setWarrantyMonths(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
          />
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
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} />
          New Arrival
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isAuthentic} onChange={(e) => setIsAuthentic(e.target.checked)} />
          Authentic / Genuine product
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

      {/* Specifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
        {specs.map((spec, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              placeholder="Label (e.g. Storage)"
              value={spec.label}
              onChange={(e) => setSpecs((prev) => prev.map((s, j) => j === i ? { ...s, label: e.target.value } : s))}
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            />
            <input
              placeholder="Value (e.g. 256 GB)"
              value={spec.value}
              onChange={(e) => setSpecs((prev) => prev.map((s, j) => j === i ? { ...s, value: e.target.value } : s))}
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            />
            <button type="button" onClick={() => setSpecs((prev) => prev.filter((_, j) => j !== i))} className="text-rose-500 hover:text-rose-700 text-lg leading-none px-1">×</button>
          </div>
        ))}
        <button type="button" onClick={() => setSpecs((prev) => [...prev, { label: "", value: "" }])} className="text-sm text-blue-600 hover:underline mt-1">+ Add spec</button>
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
