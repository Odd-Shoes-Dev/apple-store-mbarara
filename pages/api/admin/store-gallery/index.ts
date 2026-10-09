import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getStoreGalleryService } from "../../../../server/config/services";
import { z } from "zod";

const createSchema = z.object({
  imageUrl: z.string().url(),
  imageKey: z.string().min(1),
  caption: z.string().max(80).optional().nullable(),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const svc = getStoreGalleryService();

  if (req.method === "GET") {
    const images = await svc.listAll();
    return res.status(200).json({ images });
  }

  if (req.method === "POST") {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }
    try {
      const image = await svc.create({ ...parsed.data, caption: parsed.data.caption ?? null });
      return res.status(201).json({ image });
    } catch (err) {
      return res.status(400).json({ message: err instanceof Error ? err.message : "Failed to create" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: "Method not allowed" });
}
