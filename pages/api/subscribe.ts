import { NextApiRequest, NextApiResponse } from "next";
import { getSubscriberService } from "../../server/config/services";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  await getSubscriberService().subscribe(parsed.data.email);
  return res.status(201).json({ message: "Subscribed" });
}
