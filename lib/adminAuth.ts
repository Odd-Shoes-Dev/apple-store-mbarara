import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";

const REDIRECT_TO_LOGIN = {
  redirect: { destination: "/admin/login", permanent: false },
} as const;

export async function requireAdminPage(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  return session ? null : REDIRECT_TO_LOGIN;
}

export async function requireAdminApi(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return true;
}
