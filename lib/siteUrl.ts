import { IncomingMessage } from "http";

export function getSiteOrigin(req: IncomingMessage): string {
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
  const host = req.headers.host;
  return `${proto}://${host}`;
}
