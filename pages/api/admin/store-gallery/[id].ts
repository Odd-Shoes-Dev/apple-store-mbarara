import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getStoreGalleryService } from "../../../../server/config/services";
import { getStorageProvider } from "../../../../server/config/providers";
import { z } from "zod";

const updateSchema = z.object({
  caption: z.string().max(80).optional().nullable(),
  position: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "Bad id" });

  const svc = getStoreGalleryService();

  if (req.method === "PATCH") {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }
    const image = await svc.update(id, parsed.data);
    return res.status(200).json({ image });
  }

  if (req.method === "DELETE") {
    const existing = await svc.getById(id);
    await svc.delete(id);
    if (existing?.imageKey) {
      await getStorageProvider().delete(existing.imageKey);
    }
    return res.status(200).json({ message: "Deleted" });
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ message: "Method not allowed" });
}
