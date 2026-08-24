import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getCatalogService } from "../../../../server/config/services";
import { newProductSchema } from "../../../../server/domain/validation";
import { slugify } from "../../../../server/domain/slugify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const catalogService = getCatalogService();

  if (req.method === "GET") {
    const { search, categoryId, active } = req.query;

    const products = await catalogService.listAllProducts({
      search: typeof search === "string" && search.length > 0 ? search : undefined,
      categoryIds: typeof categoryId === "string" && categoryId.length > 0 ? [categoryId] : undefined,
      active: active === "true" ? true : active === "false" ? false : undefined,
    });

    return res.status(200).json({ products });
  }

  if (req.method === "POST") {
    const body = { ...req.body, slug: req.body?.slug || slugify(req.body?.name ?? "") };
    const parsed = newProductSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const product = await catalogService.createProduct(parsed.data);
    return res.status(201).json({ product });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: "Method not allowed" });
}
