import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getCatalogService } from "../../../../server/config/services";
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

    const product = await catalogService.updateProduct(id, parsed.data);
    return res.status(200).json({ product });
  }

  if (req.method === "DELETE") {
    await catalogService.archiveProduct(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  return res.status(405).json({ message: "Method not allowed" });
}
