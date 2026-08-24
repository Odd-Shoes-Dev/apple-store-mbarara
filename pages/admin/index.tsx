import { GetServerSideProps } from "next";
import { requireAdminPage } from "../../lib/adminAuth";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { redirect: { destination: "/admin/products", permanent: false } };
};

export default function AdminIndex() {
  return null;
}
