import { NextApiRequest, NextApiResponse } from "next";
import { getExchangeRateService } from "../../server/config/services";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const rate = await getExchangeRateService().getEffectiveRate();
    return res.status(200).json({ rate });
  } catch {
    return res.status(503).json({ message: "Exchange rate unavailable" });
  }
}
