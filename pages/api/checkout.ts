import { NextApiRequest, NextApiResponse } from "next";
import { getCheckoutService } from "../../server/config/services";
import { checkoutRequestSchema } from "../../server/domain/validation";
import { EmptyCartError, InvalidCartItemError } from "../../server/services/checkoutService";

type Res = {
  redirectUrl?: string;
  message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Res>) {
  if (req.method != "POST") {
    res.status(405).json({ message: "POST method required" });
    return;
  }

  const parsed = checkoutRequestSchema.safeParse(
    typeof req.body === "string" ? JSON.parse(req.body) : req.body
  );

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid cart" });
    return;
  }

  try {
    const host = req.headers.host || "";
    const baseUrl = `http://${host}`;

    const result = await getCheckoutService().createCheckout(parsed.data.items, baseUrl);

    res.status(201).json({ redirectUrl: result.redirectUrl });
  } catch (e) {
    if (e instanceof EmptyCartError || e instanceof InvalidCartItemError) {
      res.status(400).json({ message: e.message });
      return;
    }

    // @ts-ignore
    res.status(500).json({ message: e.message });
  }
}
