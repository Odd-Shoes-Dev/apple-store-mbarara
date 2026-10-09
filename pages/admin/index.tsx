import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { requireAdminPage } from "../../lib/adminAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getCatalogService,
  getReviewService,
  getTradeinService,
  getRepairService,
  getHeroService,
  getStoreGalleryService,
  getSubscriberService,
} from "../../server/config/services";

type Props = {
  pendingReviews: number;
  pendingTradeins: number;
  pendingRepairs: number;
  activeProducts: number;
  outOfStock: number;
  featuredProducts: number;
  liveHeroSlides: number;
  galleryImages: number;
  subscribers: number;
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;

  const [products, reviews, tradeins, repairs, heroSlides, galleryImages, subscribers] = await Promise.all([
    getCatalogService().listAllProducts({}),
    getReviewService().listAll(),
    getTradeinService().list(),
    getRepairService().list(),
    getHeroService().listAll(),
    getStoreGalleryService().listAll(),
    getSubscriberService().list(),
  ]);

  return {
    props: {
      pendingReviews: reviews.filter((r) => !r.approved).length,
      pendingTradeins: tradeins.filter((t) => t.status === "pending").length,
      pendingRepairs: repairs.filter((r) => r.status === "pending").length,
      activeProducts: products.filter((p) => p.active).length,
      outOfStock: products.filter((p) => p.active && p.stockCount === 0).length,
      featuredProducts: products.filter((p) => p.active && p.isFeatured).length,
      liveHeroSlides: heroSlides.filter((s) => s.active).length,
      galleryImages: galleryImages.length,
      subscribers: subscribers.length,
    },
  };
};

type ActionCardProps = {
  href: string;
  label: string;
  count: number;
  noun: string;
};

const ActionCard = ({ href, label, count, noun }: ActionCardProps) => {
  const needsAttention = count > 0;
  return (
    <Link href={href} passHref>
      <a
        className={`flex items-center justify-between rounded-2xl p-5 border transition-colors ${
          needsAttention
            ? "bg-amber-50 border-amber-200 hover:bg-amber-100"
            : "bg-white border-gray-200 hover:border-gray-300"
        }`}
      >
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${needsAttention ? "text-amber-700" : "text-gray-900"}`}>
            {count}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {count === 1 ? noun : `${noun}s`} {needsAttention ? "waiting" : "— all caught up"}
          </p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </a>
    </Link>
  );
};

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-200">
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

const AdminDashboard: NextPage<Props> = ({
  pendingReviews,
  pendingTradeins,
  pendingRepairs,
  activeProducts,
  outOfStock,
  featuredProducts,
  liveHeroSlides,
  galleryImages,
  subscribers,
}) => {
  return (
    <>
      <Head>
        <title>Admin | Dashboard</title>
      </Head>
      <AdminLayout>
        <main className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500 mb-8">Here&apos;s what&apos;s happening in your store.</p>

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Needs your attention</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <ActionCard href="/admin/reviews" label="Reviews" count={pendingReviews} noun="review" />
            <ActionCard href="/admin/trade-in" label="Trade-in requests" count={pendingTradeins} noun="request" />
            <ActionCard href="/admin/repair" label="Repair requests" count={pendingRepairs} noun="request" />
          </div>

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Store at a glance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Active products" value={activeProducts} />
            <StatCard label="Out of stock" value={outOfStock} />
            <StatCard label="Featured products" value={featuredProducts} />
            <StatCard label="Live hero slides" value={liveHeroSlides} />
            <StatCard label="Gallery images" value={`${galleryImages} / 3`} />
            <StatCard label="Newsletter subscribers" value={subscribers} />
          </div>
        </main>
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
