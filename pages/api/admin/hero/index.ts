import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getHeroService } from "../../../../server/config/services";
import { z } from "zod";

const slideSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  categoryLabel: z.string().optional().nullable(),
  priceLabel: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  imageKey: z.string().optional().nullable(),
  ctaPrimaryLabel: z.string().min(1).default("Shop Now"),
  ctaPrimaryHref: z.string().min(1).default("/store"),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#000000"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#c9a15a"),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const svc = getHeroService();

  if (req.method === "GET") {
    const slides = await svc.listAll();
    return res.status(200).json({ slides });
  }

  if (req.method === "POST") {
    const parsed = slideSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }
    const { subtitle, categoryLabel, priceLabel, imageUrl, imageKey, ...rest } = parsed.data;
    const slide = await svc.create({
      ...rest,
      subtitle: subtitle ?? null,
      categoryLabel: categoryLabel ?? null,
      priceLabel: priceLabel ?? null,
      imageUrl: imageUrl ?? null,
      imageKey: imageKey ?? null,
    });
    return res.status(201).json({ slide });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: "Method not allowed" });
}
