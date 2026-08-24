import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getCategoryService } from "../../../../server/config/services";
import { newCategorySchema } from "../../../../server/domain/validation";
import { slugify } from "../../../../server/domain/slugify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const categoryService = getCategoryService();

  if (req.method === "GET") {
    const categories = await categoryService.listAllFlat();
    return res.status(200).json({ categories });
  }

  if (req.method === "POST") {
    const body = { ...req.body, slug: req.body?.slug || slugify(req.body?.name ?? "") };
    const parsed = newCategorySchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    try {
      const category = await categoryService.create(parsed.data);
      return res.status(201).json({ category });
    } catch (err) {
      // @ts-ignore
      return res.status(400).json({ message: err.message });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: "Method not allowed" });
}
