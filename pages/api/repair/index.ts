import { NextApiRequest, NextApiResponse } from "next";
import { getRepairService } from "../../../server/config/services";
import { z } from "zod";

const repairSchema = z.object({
  customerName: z.string().min(1).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional().nullable(),
  deviceName: z.string().min(1).max(200),
  deviceType: z.enum(["iphone", "macbook", "ipad", "apple_watch"]),
  issueDescription: z.string().min(1).max(1000),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const parsed = repairSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  await getRepairService().submit(parsed.data);
  return res.status(201).json({ message: "Repair request submitted" });
}
