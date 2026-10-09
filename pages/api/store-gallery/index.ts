import { NextApiRequest, NextApiResponse } from "next";
import { getStoreGalleryService } from "../../../server/config/services";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }
  const images = await getStoreGalleryService().listActive();
  return res.status(200).json({ images });
}
