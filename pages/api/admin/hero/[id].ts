import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getHeroService } from "../../../../server/config/services";
import { getStorageProvider } from "../../../../server/config/providers";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional().nullable(),
  categoryLabel: z.string().optional().nullable(),
  priceLabel: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  imageKey: z.string().optional().nullable(),
  ctaPrimaryLabel: z.string().min(1).optional(),
  ctaPrimaryHref: z.string().min(1).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  position: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "Bad id" });

  const svc = getHeroService();

  if (req.method === "PATCH") {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const existing = await svc.getById(id);
    const slide = await svc.update(id, parsed.data);

    // If the image was replaced, the old file is now orphaned in storage.
    if (
      existing?.imageKey &&
      parsed.data.imageKey !== undefined &&
      parsed.data.imageKey !== existing.imageKey
    ) {
      await getStorageProvider().delete(existing.imageKey);
    }

    return res.status(200).json({ slide });
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
