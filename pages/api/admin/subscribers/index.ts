import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getSubscriberService } from "../../../../server/config/services";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  if (req.method === "GET") {
    const subscribers = await getSubscriberService().list();

    if (req.query.format === "csv") {
      const csv = ["email,joined_at", ...subscribers.map((s) => `${s.email},${s.createdAt}`)].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=subscribers.csv");
      return res.status(200).send(csv);
    }

    return res.status(200).json({ subscribers });
  }

  res.setHeader("Allow", "GET");
  return res.status(405).json({ message: "Method not allowed" });
}
