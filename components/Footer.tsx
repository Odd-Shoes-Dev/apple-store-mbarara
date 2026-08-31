import Link from "next/link";

const icons = [
  { src: "/icons/home-icon.png", alt: "Home", href: "/" },
  { src: "/icons/iphone-icon.png", alt: "iPhone", href: "/store?category=iphone" },
  { src: "/icons/macbook-icon.png", alt: "Mac", href: "/store?category=mac" },
  { src: "/icons/watch-icon.png", alt: "Apple Watch", href: "/store?category=apple-watch" },
  { src: "/icons/airpods-icon.png", alt: "AirPods", href: "/store?category=apple-accessories" },
];

const shopLinks = [
  { label: "iPhone", href: "/store?category=iphone" },
  { label: "Mac", href: "/store?category=mac" },
  { label: "iPad", href: "/store?category=ipad" },
  { label: "Watch", href: "/store?category=apple-watch" },
];

const supportLinks = [
  { label: "Repairs", href: "#" },
  { label: "Warranty", href: "#" },
  { label: "Trade-in", href: "#" },
];

const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-200">
    {/* Link columns */}
    <div className="max-w-5xl mx-auto px-5 lg:px-0 pt-14 pb-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <p className="text-sm font-semibold text-gray-900">Apple Store Mbarara</p>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Genuine Apple products, locally available in Mbarara, Uganda.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Shop</h5>
          <ul className="space-y-2">
            {shopLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} passHref>
                  <a className="text-sm text-gray-500 hover:text-gray-800 transition-colors">{l.label}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Support</h5>
          <ul className="space-y-2">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} passHref>
                  <a className="text-sm text-gray-500 hover:text-gray-800 transition-colors">{l.label}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Store */}
        <div>
          <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Store</h5>
          <ul className="space-y-2">
            <li className="text-sm text-gray-500">High Street, Mbarara</li>
            <li>
              <a href="tel:+256780526527" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                +256 780 526 527
              </a>
            </li>
            {waNumber && (
              <li>
                <a
                  href={`https://wa.me/${waNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t border-gray-200" />

    {/* Icons + copyright */}
    <div className="max-w-5xl mx-auto px-5 lg:px-0 py-8 flex flex-col items-center gap-6">
      <div className="flex items-center gap-8 sm:gap-14">
        {icons.map(({ src, alt, href }) => (
          <Link key={alt} href={href} passHref>
            <a title={alt}>
              <img
                src={src}
                alt={alt}
                className="w-10 h-10 object-contain opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
            </a>
          </Link>
        ))}
      </div>
      <p className="text-xs text-gray-400 tracking-wide">
        Copyright &copy; {new Date().getFullYear()} Apple Store Mbarara. All Rights Reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
