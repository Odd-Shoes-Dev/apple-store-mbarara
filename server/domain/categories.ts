import { ProductCategory } from "./types";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  MACBOOK: "Mac",
  IPAD: "iPad",
  IPHONE: "iPhone",
  WATCH: "Apple Watch",
  ACCESSORIES: "Apple Accessories",
  OTHER: "Other",
};

// The categories shown as direct links in the header nav, in display order.
export const NAV_CATEGORIES: ProductCategory[] = ["MACBOOK", "IPAD", "IPHONE", "WATCH", "ACCESSORIES"];
