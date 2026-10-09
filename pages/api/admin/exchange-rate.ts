import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "../../../lib/adminAuth";
import { getExchangeRateService } from "../../../server/config/services";
import { z } from "zod";

const updateSchema = z.object({
  mode: z.enum(["live", "manual"]).optional(),
  manualRate: z.number().positive().nullable().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  const svc = getExchangeRateService();

  if (req.method === "GET") {
    const [settings, liveRate] = await Promise.all([
      svc.getSettings(),
      svc.getLiveRate().catch(() => null),
    ]);
    return res.status(200).json({ settings, liveRate });
  }

  if (req.method === "PATCH") {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }
    const settings = await svc.updateSettings(parsed.data);
    return res.status(200).json({ settings });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ message: "Method not allowed" });
}
