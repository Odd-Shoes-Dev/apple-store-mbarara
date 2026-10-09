import { FunctionComponent, useContext, useEffect, useState } from "react";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../public/logo.png";
import { ShoppingBagIcon } from "@heroicons/react/outline";
import { Popover, Transition } from "@headlessui/react";
import CartContext from "./context/CartContext";
import { useDisplayCurrency } from "./context/DisplayCurrencyContext";
import { convertAmount, formatCurrency } from "../utils/currency";
import {
  getProductPrice,
  getProductDescription,
  getProductImage,
  getProductName,
} from "../utils/computed";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/store" },
  { label: "Repair", href: "/repair" },
  { label: "Trade-in", href: "/trade-in" },
  { label: "Delivery", href: "/delivery" },
  { label: "About", href: "/about" },
];

const Header: FunctionComponent = () => {
  const { items, remove, removeAll } = useContext(CartContext);
  const { currency, setCurrency, rate, formatProductPrice } = useDisplayCurrency();
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const removeFromCart = (productID: string) => {
    if (remove) {
      remove(productID);
    }
  };

  const removeAllFromCart = () => {
    if (removeAll) {
      removeAll();
    }
  };

  const cartTotal = (items ?? []).reduce((sum, product) => {
    const amount = getProductPrice(product);
    if (product.currency === currency) return sum + amount;
    if (rate === null) return sum; // converted total catches up once the rate loads
    return sum + convertAmount(amount, product.currency, currency, rate);
  }, 0);

  const whatsappOrderLink = (() => {
    if (!waNumber || !items || items.length === 0) return null;
    const lines = items.map(
      (product) => `- ${getProductName(product)} — ${formatProductPrice(getProductPrice(product), product.currency)}`
    );
    const message = [
      "Hi, I'd like to order:",
      ...lines,
      "",
      `Total: ${formatCurrency(cartTotal, currency)}`,
    ].join("\n");
    return `https://wa.me/${waNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  })();

  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 80) {
        setHidden(false);
      } else if (currentScrollY > lastScrollY) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-white/80 backdrop-blur-xl backdrop-saturate-[180%] border-b border-black/[0.08] transition-transform duration-300 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav aria-label="Top" className="max-w-5xl mx-auto">
        <div className="relative px-5 sm:static sm:px-5 sm:pb-0 md:px-5 lg:px-0">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex-1 flex items-center">
              <Link href="/" passHref>
                <a className="flex items-center">
                  <Image src={Logo} width={101} height={36} alt="Apple Store Mbarara" />
                </a>
              </Link>
            </div>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} passHref>
                  <a className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>

            <div className="flex-1 flex items-center justify-end">
              {/* Currency toggle */}
              <button
                onClick={() => setCurrency(currency === "ugx" ? "usd" : "ugx")}
                className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:border-gray-400 transition-colors"
                aria-label="Toggle display currency"
              >
                {currency.toUpperCase()}
              </button>

              {/* Cart */}
              <Popover className="ml-4 flow-root text-sm lg:relative lg:ml-8 z-50">
                <Popover.Button className="group -m-2 p-2 flex items-center">
                  <ShoppingBagIcon
                    className="flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                    {items?.length}
                  </span>
                  <span className="sr-only">items in cart, view bag</span>
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Popover.Panel className="absolute top-16 inset-x-0 mt-px pb-6 bg-white shadow-lg sm:px-2 lg:top-full lg:left-auto lg:right-0 lg:mt-3 lg:-mr-1.5 lg:w-80 lg:rounded-lg lg:ring-1 lg:ring-black lg:ring-opacity-5">
                    <h2 className="sr-only">Shopping Cart</h2>

                    <div className="max-w-2xl mx-auto px-4">
                      <ul role="list" className="divide-y divide-gray-200">
                        {items?.length !== 0 &&
                          items?.map((product) => (
                            <li key={product.id} className="py-6 flex">
                              <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                <img
                                  src={getProductImage(product)}
                                  alt={getProductDescription(product)}
                                  className="w-full h-full object-center object-cover"
                                />
                              </div>

                              <div className="ml-4 flex-1 flex flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{getProductName(product)}</h3>
                                    <p className="ml-4 text-teal-600">
                                      {formatProductPrice(getProductPrice(product), product.currency)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex-1 flex items-center justify-between text-sm">
                                  <div className="flex">
                                    <button
                                      onClick={(e) => removeFromCart(product.id)}
                                      type="button"
                                      className="font-medium text-rose-600 hover:text-rose-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        {items?.length !== 0 && (
                          <div className="flex justify-center items-center py-3">
                            <p className="text-lg font-semibold text-gray-600">
                              Total:{" "}
                              <span className="text-teal-600">{formatCurrency(cartTotal, currency)}</span>
                            </p>
                          </div>
                        )}
                        {items?.length === 0 && (
                          <div className="flex justify-center items-center py-5">
                            <p className="text-lg text-gray-900">
                              Cart is empty
                            </p>
                          </div>
                        )}
                      </ul>
                      <div className="flex justify-between gap-3">
                        <button
                          onClick={removeAllFromCart}
                          className="w-full border border-rose-600 rounded-md shadow-sm py-2 px-4 text-sm text-rose-600 hover:bg-rose-600 hover:text-white transition duration-300 ease-in-out"
                        >
                          Remove All
                        </button>
                        {whatsappOrderLink ? (
                          <a
                            href={whatsappOrderLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] border border-[#25D366] rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-[#1ebe5d]"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Order via WhatsApp
                          </a>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white cursor-not-allowed"
                          >
                            Order via WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </Popover>

              {/* Hamburger — mobile only, asymmetric bars that morph into an X */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="sm:hidden ml-3 -mr-1 p-2 flex items-center justify-center"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <div className="relative w-6 h-4">
                  <span
                    className={`absolute left-0 h-[2px] bg-gray-900 rounded-full transition-all duration-300 ease-out ${
                      mobileOpen ? "w-6 top-[7px] rotate-45" : "w-6 top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[7px] h-[2px] bg-gray-900 rounded-full transition-all duration-200 ease-out ${
                      mobileOpen ? "w-0 opacity-0" : "w-3.5 opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute left-0 h-[2px] bg-gray-900 rounded-full transition-all duration-300 ease-out ${
                      mobileOpen ? "w-6 top-[7px] -rotate-45" : "w-5 top-[14px]"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile menu panel — overlays the page instead of pushing it down */}
          <Transition
            show={mobileOpen}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-2"
          >
            <div className="sm:hidden absolute top-full inset-x-0 z-50 bg-white border-t border-black/[0.08] shadow-lg px-5 flex flex-col divide-y divide-gray-100">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} passHref>
                  <a
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-4 text-xl font-semibold text-gray-900 hover:text-gray-600"
                  >
                    {link.label}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </a>
                </Link>
              ))}
              <button
                onClick={() => setCurrency(currency === "ugx" ? "usd" : "ugx")}
                className="flex items-center justify-between py-4 text-xl font-semibold text-gray-900 hover:text-gray-600"
              >
                Currency
                <span className="text-sm font-bold px-3 py-1 rounded-full border border-gray-300 text-gray-700">
                  {currency.toUpperCase()}
                </span>
              </button>
            </div>
          </Transition>
        </div>
      </nav>
    </header>
  );
};

export default Header;
