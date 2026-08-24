import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import { requireAdminApi } from "../../../../lib/adminAuth";
import { getStorageProvider } from "../../../../server/config/providers";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdminApi(req, res))) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ maxFiles: 1, maxFileSize: 10 * 1024 * 1024 });
  const [, files] = await form.parse(req);

  const fileField = files.file;
  const file = Array.isArray(fileField) ? fileField[0] : fileField;

  if (!file) {
    return res.status(400).json({ message: "No file provided" });
  }

  const buffer = await fs.readFile(file.filepath);
  const uploaded = await getStorageProvider().upload(
    buffer,
    file.originalFilename ?? "upload",
    file.mimetype ?? "application/octet-stream"
  );

  return res.status(201).json(uploaded);
}
