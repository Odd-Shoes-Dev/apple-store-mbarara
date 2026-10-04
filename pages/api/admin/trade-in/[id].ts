import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getTradeinService } from "../../../../server/config/services";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "rejected"]),
  adminNote: z.string().optional().nullable(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "Bad id" });

  if (req.method === "PATCH") {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }
    const request = await getTradeinService().updateStatus(id, parsed.data.status, parsed.data.adminNote);
    return res.status(200).json({ request });
  }

  res.setHeader("Allow", "PATCH");
  return res.status(405).json({ message: "Method not allowed" });
}
