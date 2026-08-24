import { FunctionComponent, useContext, useEffect, useState } from "react";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import AppleLogo from "../public/apple-icon.svg";
import { ShoppingBagIcon } from "@heroicons/react/outline";
import { Popover, Transition } from "@headlessui/react";
import CartContext from "./context/CartContext";
import {
  getProductPrice,
  formatPrice,
  getProductDescription,
  getProductImage,
  getProductName,
} from "../utils/computed";
import { CategoryWithChildren } from "../server/domain/types";

type Props = {
  navTree: CategoryWithChildren[];
};

const Header: FunctionComponent<Props> = ({ navTree }) => {
  const { items, remove, removeAll, total } = useContext(CartContext);

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

  const checkout = async () => {
    const cartItems = items?.map((product) => ({
      productId: product.id,
      quantity: 1,
    }));

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems }),
    });

    const data = await res.json();
    window.location.href = data.redirectUrl;
  };

  const [hidden, setHidden] = useState(false);

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
      className={`sticky top-0 z-40 bg-white transition-transform duration-300 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav aria-label="Top" className="max-w-5xl mx-auto">
        <div className="relative px-5 sm:static sm:px-5 sm:pb-0 md:px-5 lg:px-0">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex-1 flex items-center">
              <Link href="/" className="flex items-center">
                <Image src={AppleLogo} width="50" height="50" alt="icon" />
              </Link>
            </div>

            {/* Category links */}
            <div className="hidden sm:flex items-center gap-6">
              {navTree.map((department) =>
                department.children.length === 0 ? (
                  <Link
                    key={department.id}
                    href={{ pathname: "/", query: { category: department.slug } }}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    {department.name}
                  </Link>
                ) : (
                  <Popover key={department.id} className="relative">
                    <Popover.Button className="text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
                      {department.name}
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-150"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-0 top-full mt-2 w-56 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 py-2 z-50">
                        <div className="flex flex-col">
                          <Link href={{ pathname: "/", query: { category: department.slug } }} passHref>
                            <a className="pl-4 pr-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                              {`All ${department.name}`}
                            </a>
                          </Link>
                          <div className="border-t my-1" />
                          {department.children.map((model) => (
                            <Link key={model.id} href={{ pathname: "/", query: { category: model.slug } }} passHref>
                              <a className="pl-4 pr-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                {model.name}
                              </a>
                            </Link>
                          ))}
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </Popover>
                )
              )}
            </div>

            <div className="flex-1 flex items-center justify-end">
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
                                      {formatPrice(getProductPrice(product))}
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
                              <span className="text-teal-600">{formatPrice(total ?? 0)}</span>
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
                        <button
                          onClick={checkout}
                          className="w-full bg-slate-800 border border-slate-800 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-slate-900 focus:outline-none focus:bg-slate-800"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </Popover>
            </div>
          </div>

          {/* Category links (mobile second row) */}
          <div className="grid grid-cols-3 sm:hidden gap-x-2 gap-y-2 border-t py-2">
            {navTree.map((department, index) => {
              const col = index % 3;
              const panelAlign = col === 2 ? "right-0" : "left-0";
              return department.children.length === 0 ? (
                <Link key={department.id} href={{ pathname: "/", query: { category: department.slug } }} passHref>
                  <a className="text-xs font-medium text-gray-700 hover:text-gray-900 text-center">
                    {department.name}
                  </a>
                </Link>
              ) : (
                <Popover key={department.id} className="relative">
                  <Popover.Button className="text-xs font-medium text-gray-700 hover:text-gray-900 focus:outline-none w-full text-center">
                    {department.name}
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className={`absolute ${panelAlign} top-full mt-1 w-44 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 py-2 z-50`}>
                      <div className="flex flex-col">
                        <Link href={{ pathname: "/", query: { category: department.slug } }} passHref>
                          <a className="pl-4 pr-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                            {`All ${department.name}`}
                          </a>
                        </Link>
                        <div className="border-t my-1" />
                        {department.children.map((model) => (
                          <Link key={model.id} href={{ pathname: "/", query: { category: model.slug } }} passHref>
                            <a className="pl-4 pr-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              {model.name}
                            </a>
                          </Link>
                        ))}
                      </div>
                    </Popover.Panel>
                  </Transition>
                </Popover>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
