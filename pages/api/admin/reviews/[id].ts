import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getReviewService } from "../../../../server/config/services";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "Bad id" });

  if (req.method === "PATCH") {
    await getReviewService().approve(id);
    return res.status(200).json({ message: "Approved" });
  }

  if (req.method === "DELETE") {
    await getReviewService().delete(id);
    return res.status(200).json({ message: "Deleted" });
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ message: "Method not allowed" });
}
