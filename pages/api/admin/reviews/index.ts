import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getReviewService } from "../../../../server/config/services";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  if (req.method === "GET") {
    const reviews = await getReviewService().listAll();
    return res.status(200).json({ reviews });
  }

  res.setHeader("Allow", "GET");
  return res.status(405).json({ message: "Method not allowed" });
}
