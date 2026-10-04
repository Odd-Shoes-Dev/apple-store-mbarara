import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getSpecService } from "../../../../server/config/services";
import { z } from "zod";

const specsSchema = z.array(
  z.object({
    label: z.string().min(1),
    value: z.string().min(1),
    position: z.number().int().min(0),
  })
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const { productId } = req.query;
  if (typeof productId !== "string") return res.status(400).json({ message: "Bad productId" });

  if (req.method === "GET") {
    const specs = await getSpecService().listForProduct(productId);
    return res.status(200).json({ specs });
  }

  if (req.method === "PUT") {
    const parsed = specsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }
    const specs = await getSpecService().saveForProduct(productId, parsed.data);
    return res.status(200).json({ specs });
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ message: "Method not allowed" });
}
