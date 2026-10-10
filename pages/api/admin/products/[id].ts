import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getCatalogService } from "../../../../server/config/services";
import { getStorageProvider } from "../../../../server/config/providers";
import { updateProductSchema } from "../../../../server/domain/validation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const id = req.query.id as string;
  const catalogService = getCatalogService();

  if (req.method === "GET") {
    const product = await catalogService.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.status(200).json({ product });
  }

  if (req.method === "PATCH") {
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    // If images are being replaced, figure out which ones are actually
    // dropped so we can clean them up from storage after the update.
    let droppedImageKeys: string[] = [];
    if (parsed.data.images) {
      const existing = await catalogService.getProductById(id);
      const newKeys = new Set(parsed.data.images.map((img) => img.key));
      droppedImageKeys = (existing?.images ?? [])
        .map((img) => img.key)
        .filter((key) => !newKeys.has(key));
    }

    const product = await catalogService.updateProduct(id, parsed.data);

    if (droppedImageKeys.length > 0) {
      const storage = getStorageProvider();
      await Promise.allSettled(droppedImageKeys.map((key) => storage.delete(key)));
    }

    return res.status(200).json({ product });
  }

  if (req.method === "DELETE") {
    const hardDelete = req.query.hard === "true" || req.query.hard === "1";

    if (!hardDelete) {
      await catalogService.archiveProduct(id);
      return res.status(204).end();
    }

    const existing = await catalogService.getProductById(id);
    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }

    await catalogService.deleteProduct(id);

    if (existing.images.length > 0) {
      const storage = getStorageProvider();
      await Promise.allSettled(existing.images.map((img) => storage.delete(img.key)));
    }

    return res.status(204).end();
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  return res.status(405).json({ message: "Method not allowed" });
}
