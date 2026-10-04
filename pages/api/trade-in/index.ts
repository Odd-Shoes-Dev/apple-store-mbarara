import { NextApiRequest, NextApiResponse } from "next";
import { getTradeinService } from "../../../server/config/services";
import { z } from "zod";

const tradeinSchema = z.object({
  customerName: z.string().min(1).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional().nullable(),
  deviceName: z.string().min(1).max(200),
  deviceCondition: z.enum(["good", "fair", "poor"]),
  notes: z.string().max(1000).optional().nullable(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const parsed = tradeinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  await getTradeinService().submit(parsed.data);
  return res.status(201).json({ message: "Trade-in request submitted" });
}
