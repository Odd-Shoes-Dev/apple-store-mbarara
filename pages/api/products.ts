import { NextApiRequest, NextApiResponse } from "next";
import { getCatalogService } from "../../server/config/services";

const MAX_PAGE_SIZE = 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { search, categoryIds, sort, page, pageSize } = req.query;

  const parsedPage = Math.max(1, parseInt(typeof page === "string" ? page : "1", 10) || 1);
  const parsedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(typeof pageSize === "string" ? pageSize : "12", 10) || 12)
  );
  const parsedSort = sort === "priceAsc" || sort === "priceDesc" ? sort : "newest";

  const result = await getCatalogService().listProductsPage(
    {
      active: true,
      search: typeof search === "string" && search.length > 0 ? search : undefined,
      categoryIds: typeof categoryIds === "string" && categoryIds.length > 0 ? categoryIds.split(",") : undefined,
      sort: parsedSort,
    },
    parsedPage,
    parsedPageSize
  );

  // CDN-cached briefly; SWR on the client revalidates on its own on top of this,
  // so changes (new/archived products) never stay stale for more than ~30-60s.
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res.status(200).json(result);
}
