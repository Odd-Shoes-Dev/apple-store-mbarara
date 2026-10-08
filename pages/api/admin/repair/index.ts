import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getRepairService } from "../../../../server/config/services";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  if (req.method === "GET") {
    const requests = await getRepairService().list();
    return res.status(200).json({ requests });
  }

  res.setHeader("Allow", "GET");
  return res.status(405).json({ message: "Method not allowed" });
}
