import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState, ChangeEvent } from "react";
import { requireAdminPage } from "../../lib/adminAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import RowActionsMenu from "../../components/admin/RowActionsMenu";
import Spinner from "../../components/Spinner";
import { useConfirm } from "../../components/context/ConfirmContext";
import { StoreGalleryImage } from "../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

const MAX_ACTIVE_IMAGES = 3;

const EMPTY_FORM = {
  caption: "",
  active: true,
};

type FormState = typeof EMPTY_FORM;

const AdminStoreGallery: NextPage = () => {
  const [images, setImages] = useState<StoreGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<StoreGalleryImage | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const confirm = useConfirm();

  const activeCount = images.filter((img) => img.active).length;

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/store-gallery");
    const data = await res.json();
    setImages(data.images ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, active: activeCount < MAX_ACTIVE_IMAGES });
    setImageUrl(null);
    setImageKey(null);
    setError(null);
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (image: StoreGalleryImage) => {
    setForm({ caption: image.caption ?? "", active: image.active });
    setImageUrl(image.imageUrl);
    setImageKey(image.imageKey);
    setError(null);
    setEditing(image);
    setCreating(true);
  };

  const close = () => { setCreating(false); setEditing(null); };

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/products/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setImageUrl(data.url);
      setImageKey(data.key);
    } else {
      setError("Image upload failed");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    setError(null);
    if (!imageUrl || !imageKey) {
      setError("Choose an image first");
      return;
    }
    setSaving(true);

    const body = {
      imageUrl,
      imageKey,
      caption: form.caption || null,
      active: form.active,
      position: editing ? editing.position : images.length,
    };

    const res = editing
      ? await fetch(`/api/admin/store-gallery/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/store-gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.message ?? "Failed to save");
      return;
    }
    close();
    load();
  };

  const toggleActive = async (image: StoreGalleryImage) => {
    setListError(null);
    const res = await fetch(`/api/admin/store-gallery/${image.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !image.active }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setListError(data?.message ?? "Failed to update");
      return;
    }
    load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const reordered = [...images];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);

    // Renumber everyone to 0..n-1 in the new order, not just the two swapped
    // rows — this also self-heals any stale/duplicate positions left over
    // from earlier deletes, which is what made swaps silently no-op.
    await Promise.all(
      reordered
        .map((img, i) => ({ img, position: i }))
        .filter(({ img, position }) => img.position !== position)
        .map(({ img, position }) =>
          fetch(`/api/admin/store-gallery/${img.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position }),
          })
        )
    );
    load();
  };

  const remove = async (id: string) => {
    if (!(await confirm("Delete this image?", { confirmLabel: "Delete", destructive: true }))) return;
    await fetch(`/api/admin/store-gallery/${id}`, { method: "DELETE" });

    // Renumber what's left so positions stay contiguous (0..n-1) — otherwise
    // the gap left behind can collide with a future image's position.
    const remaining = images.filter((img) => img.id !== id);
    await Promise.all(
      remaining
        .map((img, i) => ({ img, position: i }))
        .filter(({ img, position }) => img.position !== position)
        .map(({ img, position }) =>
          fetch(`/api/admin/store-gallery/${img.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position }),
          })
        )
    );
    load();
  };

  return (
    <>
      <Head><title>Admin | Store Gallery</title></Head>
      <AdminLayout>
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-gray-900">Store Gallery</h1>
            <span className="text-xs text-gray-400">{activeCount} / {MAX_ACTIVE_IMAGES} live · {images.length} total</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Shown on the landing page below &quot;Why buy from us&quot;. Add as many photos as you like — up to{" "}
            {MAX_ACTIVE_IMAGES} can be live at once, so you can swap which ones show without deleting the rest.
          </p>

          {listError && <p className="text-sm text-rose-600 mb-4">{listError}</p>}

          <div className="mb-6">
            <button
              onClick={openCreate}
              className="bg-slate-800 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-900"
            >
              + Add image
            </button>
          </div>

          {/* Image form modal */}
          {creating && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" onClick={close}>
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4">{editing ? "Edit image" : "New image"}</h2>
                {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Image *</label>
                    {imageUrl && (
                      <div className="mb-2 flex items-center gap-3">
                        <img src={imageUrl} alt="" className="w-24 h-24 object-cover rounded-lg border bg-gray-50" />
                        <button type="button" onClick={() => { setImageUrl(null); setImageKey(null); }} className="text-xs text-rose-600 hover:underline">
                          Remove
                        </button>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImage} disabled={uploading} className="text-sm" />
                    {uploading && <p className="text-xs text-gray-500 mt-1">Uploading…</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Caption (optional)</label>
                    <input
                      value={form.caption}
                      onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                      placeholder="e.g. Kampala flagship boutique"
                      maxLength={80}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    />
                    Active
                  </label>
                </div>

                <div className="flex gap-3 justify-end mt-5">
                  <button onClick={close} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
                  <button
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="bg-slate-800 text-white text-sm rounded-md px-5 py-2 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : images.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm">
              No gallery images yet. Add one to show it on the landing page.
            </div>
          ) : (
            <div className="space-y-3">
              {images.map((image, i) => (
                <div key={image.id} className="bg-white rounded-xl shadow-sm flex items-center gap-4 p-4">
                  <img src={image.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-gray-50" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{image.caption || <span className="text-gray-400">No caption</span>}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1">↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === images.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1">↓</button>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${image.active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {image.active ? "Live" : "Hidden"}
                    </span>
                    <RowActionsMenu
                      actions={[
                        { label: "Edit", onClick: () => openEdit(image) },
                        { label: image.active ? "Deactivate" : "Activate", onClick: () => toggleActive(image) },
                        { label: "Delete", onClick: () => remove(image.id), destructive: true },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminStoreGallery;
