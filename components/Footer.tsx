import Link from "next/link";

const icons = [
  { src: "/icons/home-icon.png", alt: "Home", href: "/" },
  { src: "/icons/iphone-icon.png", alt: "iPhone", href: "/?category=iphone" },
  { src: "/icons/macbook-icon.png", alt: "Mac", href: "/?category=mac" },
  { src: "/icons/watch-icon.png", alt: "Apple Watch", href: "/?category=apple-watch" },
  { src: "/icons/airpods-icon.png", alt: "AirPods", href: "/?category=apple-accessories" },
];

const Footer = () => (
  <footer className="bg-white border-t mt-12 py-10">
    <div className="max-w-5xl mx-auto flex flex-col items-center gap-6 px-4">
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
        Copyright &copy; {new Date().getFullYear()} Apple Store. All Rights Reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
