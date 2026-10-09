import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, ChangeEvent } from "react";
import { requireAdminPage } from "../../lib/adminAuth";
import Spinner from "../../components/Spinner";
import { StoreGalleryImage } from "../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

const MAX_IMAGES = 3;

const AdminStoreGallery: NextPage = () => {
  const [images, setImages] = useState<StoreGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/store-gallery");
    const data = await res.json();
    const loaded: StoreGalleryImage[] = data.images ?? [];
    setImages(loaded);
    setCaptionDrafts(Object.fromEntries(loaded.map((img) => [img.id, img.caption ?? ""])));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToUpload = files.slice(0, remainingSlots);
    let firstError: string | null =
      files.length > remainingSlots
        ? `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added (max ${MAX_IMAGES}). The rest were skipped.`
        : null;

    setError(null);
    setUploading(true);

    let nextPosition = images.length;
    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/products/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => null);
        firstError ??= data?.message ?? "One or more images failed to upload";
        continue;
      }
      const { url, key } = await uploadRes.json();

      const createRes = await fetch("/api/admin/store-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, imageKey: key, caption: null, position: nextPosition, active: true }),
      });
      if (createRes.ok) {
        nextPosition += 1;
      } else {
        const data = await createRes.json();
        firstError ??= data.message ?? "Failed to add image";
      }
    }

    setUploading(false);
    setError(firstError);
    e.target.value = "";
    load();
  };

  const saveCaption = async (id: string) => {
    await fetch(`/api/admin/store-gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: captionDrafts[id] || null }),
    });
    load();
  };

  const toggleActive = async (image: StoreGalleryImage) => {
    await fetch(`/api/admin/store-gallery/${image.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !image.active }),
    });
    load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const a = images[index];
    const b = images[target];
    await Promise.all([
      fetch(`/api/admin/store-gallery/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: b.position }),
      }),
      fetch(`/api/admin/store-gallery/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: a.position }),
      }),
    ]);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/admin/store-gallery/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <Head><title>Admin | Store Gallery</title></Head>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white border-b px-6 py-3 flex items-center gap-6 text-sm flex-wrap">
          <Link href="/admin/products" passHref><a className="font-medium text-gray-700 hover:text-gray-900">Products</a></Link>
          <Link href="/admin/hero" passHref><a className="font-medium text-gray-700 hover:text-gray-900">Hero</a></Link>
          <Link href="/admin/store-gallery" passHref><a className="font-semibold text-gray-900 underline">Store Gallery</a></Link>
          <Link href="/admin/reviews" passHref><a className="font-medium text-gray-700 hover:text-gray-900">Reviews</a></Link>
          <Link href="/admin/trade-in" passHref><a className="font-medium text-gray-700 hover:text-gray-900">Trade-in</a></Link>
          <Link href="/admin/repair" passHref><a className="font-medium text-gray-700 hover:text-gray-900">Repair</a></Link>
          <Link href="/admin/subscribers" passHref><a className="font-medium text-gray-700 hover:text-gray-900">Subscribers</a></Link>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-gray-900">Store Gallery</h1>
            <span className="text-xs text-gray-400">{images.length} / {MAX_IMAGES}</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Shown on the landing page below &quot;Why buy from us&quot;. Up to {MAX_IMAGES} photos of your store.
          </p>

          {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

          {images.length < MAX_IMAGES && (
            <div className="mb-6">
              <label className="inline-flex items-center gap-2 bg-slate-800 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-900 cursor-pointer disabled:opacity-50">
                {uploading ? "Uploading…" : "+ Upload image"}
                <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : images.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm">
              No gallery images yet. Upload one to show it on the landing page.
            </div>
          ) : (
            <div className="space-y-3">
              {images.map((image, i) => (
                <div key={image.id} className="bg-white rounded-xl shadow-sm flex items-center gap-4 p-4">
                  <img src={image.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-gray-50" />

                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Caption (optional)</label>
                    <div className="flex gap-2">
                      <input
                        value={captionDrafts[image.id] ?? ""}
                        onChange={(e) => setCaptionDrafts((d) => ({ ...d, [image.id]: e.target.value }))}
                        onBlur={() => saveCaption(image.id)}
                        placeholder="e.g. Kampala flagship boutique"
                        maxLength={80}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1">↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === images.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1">↓</button>
                    <button
                      onClick={() => toggleActive(image)}
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${image.active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {image.active ? "Live" : "Hidden"}
                    </button>
                    <button onClick={() => remove(image.id)} className="text-xs text-rose-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminStoreGallery;
