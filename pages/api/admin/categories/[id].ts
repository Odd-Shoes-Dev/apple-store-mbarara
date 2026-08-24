import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getCategoryService } from "../../../../server/config/services";
import { updateCategorySchema } from "../../../../server/domain/validation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const id = req.query.id as string;
  const categoryService = getCategoryService();

  if (req.method === "GET") {
    const category = await categoryService.getById(id);
    if (!category) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.status(200).json({ category });
  }

  if (req.method === "PATCH") {
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    try {
      const category = await categoryService.update(id, parsed.data);
      return res.status(200).json({ category });
    } catch (err) {
      // @ts-ignore
      return res.status(400).json({ message: err.message });
    }
  }

  if (req.method === "DELETE") {
    await categoryService.delete(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  return res.status(405).json({ message: "Method not allowed" });
}
