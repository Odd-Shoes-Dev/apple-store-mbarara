import { NextApiRequest, NextApiResponse } from "next";
import { getReviewService } from "../../../server/config/services";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  reviewerName: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(2000).optional().nullable(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  await getReviewService().submit(parsed.data);
  return res.status(201).json({ message: "Review submitted for approval" });
}
