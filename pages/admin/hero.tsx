import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState, ChangeEvent } from "react";
import { requireAdminPage } from "../../lib/adminAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import RowActionsMenu from "../../components/admin/RowActionsMenu";
import Spinner from "../../components/Spinner";
import { HeroSlide } from "../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

const EMPTY = {
  title: "",
  subtitle: "",
  categoryLabel: "",
  priceLabel: "",
  ctaPrimaryLabel: "Shop Now",
  ctaPrimaryHref: "/store",
  backgroundColor: "#000000",
  accentColor: "#c9a15a",
  position: 0,
  active: true,
};

type FormState = typeof EMPTY;

const AdminHero: NextPage = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/hero");
    const data = await res.json();
    setSlides(data.slides ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setImageUrl(null);
    setImageKey(null);
    setError(null);
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setForm({
      title: slide.title,
      subtitle: slide.subtitle ?? "",
      categoryLabel: slide.categoryLabel ?? "",
      priceLabel: slide.priceLabel ?? "",
      ctaPrimaryLabel: slide.ctaPrimaryLabel,
      ctaPrimaryHref: slide.ctaPrimaryHref,
      backgroundColor: slide.backgroundColor,
      accentColor: slide.accentColor,
      position: slide.position,
      active: slide.active,
    });
    setImageUrl(slide.imageUrl);
    setImageKey(slide.imageKey);
    setError(null);
    setEditing(slide);
    setCreating(true);
  };

  const close = () => { setCreating(false); setEditing(null); };

  const set = (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: field === "position" ? Number(e.target.value) : field === "active" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/products/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setImageUrl(data.url);
      setImageKey(data.key);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    setError(null);
    if (!form.title) { setError("Title is required"); return; }
    setSaving(true);

    const body = {
      ...form,
      subtitle: form.subtitle || null,
      categoryLabel: form.categoryLabel || null,
      priceLabel: form.priceLabel || null,
      imageUrl: imageUrl || null,
      imageKey: imageKey || null,
    };

    const res = editing
      ? await fetch(`/api/admin/hero/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/admin/hero", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    setSaving(false);
    if (!res.ok) { setError("Failed to save"); return; }
    close();
    load();
  };

  const toggleActive = async (slide: HeroSlide) => {
    await fetch(`/api/admin/hero/${slide.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !slide.active }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/admin/hero/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <Head><title>Admin | Hero Slides</title></Head>
      <AdminLayout>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Hero Slides</h1>
            <button onClick={openCreate} className="bg-slate-800 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-900">
              + Add slide
            </button>
          </div>

          {/* Slide form modal */}
          {creating && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" onClick={close}>
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg my-8" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4">{editing ? "Edit slide" : "New slide"}</h2>
                {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category label <span className="text-gray-400">(e.g. iPhone)</span></label>
                    <input value={form.categoryLabel} onChange={set("categoryLabel")} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                    <input value={form.title} onChange={set("title")} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle / tagline</label>
                    <input value={form.subtitle} onChange={set("subtitle")} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price label <span className="text-gray-400">(e.g. From UGX 6,250,000)</span></label>
                    <input value={form.priceLabel} onChange={set("priceLabel")} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">CTA label</label>
                      <input value={form.ctaPrimaryLabel} onChange={set("ctaPrimaryLabel")} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">CTA link</label>
                      <input value={form.ctaPrimaryHref} onChange={set("ctaPrimaryHref")} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Background color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={form.backgroundColor} onChange={set("backgroundColor")} className="w-10 h-8 rounded cursor-pointer border border-gray-300" />
                        <input value={form.backgroundColor} onChange={set("backgroundColor")} className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-mono" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Accent color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={form.accentColor} onChange={set("accentColor")} className="w-10 h-8 rounded cursor-pointer border border-gray-300" />
                        <input value={form.accentColor} onChange={set("accentColor")} className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-mono" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-end">
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                      <input type="number" min={0} value={form.position} onChange={set("position")} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 pb-1.5">
                      <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                      Active
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Product image</label>
                    {imageUrl && (
                      <div className="mb-2 flex items-center gap-3">
                        <img src={imageUrl} alt="" className="w-20 h-20 object-contain rounded border bg-gray-50" />
                        <button type="button" onClick={() => { setImageUrl(null); setImageKey(null); }} className="text-xs text-rose-600 hover:underline">Remove</button>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImage} disabled={uploading} className="text-sm" />
                    {uploading && <p className="text-xs text-gray-500 mt-1">Uploading…</p>}
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-5">
                  <button onClick={close} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
                  <button onClick={handleSave} disabled={saving || uploading} className="bg-slate-800 text-white text-sm rounded-md px-5 py-2 disabled:opacity-50">
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Slide list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : slides.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm">
              No slides yet. Add one to replace the default hero.
            </div>
          ) : (
            <div className="space-y-3">
              {slides.map((slide) => (
                <div key={slide.id} className="bg-white rounded-xl shadow-sm flex items-center gap-4 p-4">
                  {/* Color swatch */}
                  <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ background: slide.backgroundColor }}>
                    {slide.imageUrl
                      ? <img src={slide.imageUrl} alt="" className="w-full h-full object-contain" />
                      : <span className="text-xl">🖼</span>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    {slide.categoryLabel && (
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest mb-0.5" style={{ color: slide.accentColor }}>{slide.categoryLabel}</p>
                    )}
                    <p className="font-semibold text-gray-900 truncate">{slide.title}</p>
                    {slide.subtitle && <p className="text-xs text-gray-500 truncate">{slide.subtitle}</p>}
                    {slide.priceLabel && <p className="text-xs text-gray-500 mt-0.5">{slide.priceLabel}</p>}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400">#{slide.position}</span>
                    <button
                      onClick={() => toggleActive(slide)}
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${slide.active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {slide.active ? "Live" : "Hidden"}
                    </button>
                    <RowActionsMenu
                      actions={[
                        { label: "Edit", onClick: () => openEdit(slide) },
                        { label: "Delete", onClick: () => remove(slide.id), destructive: true },
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

export default AdminHero;
