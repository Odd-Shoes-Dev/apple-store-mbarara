import { NextApiRequest, NextApiResponse } from "next";
import { getExchangeRateService } from "../../server/config/services";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const rate = await getExchangeRateService().getEffectiveRate();
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json({ rate });
  } catch {
    return res.status(503).json({ message: "Exchange rate unavailable" });
  }
}
