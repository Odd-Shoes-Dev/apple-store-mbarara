export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  position: number;
};

export type CategoryWithChildren = Category & { children: Category[] };

export type NewCategoryInput = {
  name: string;
  slug: string;
  parentId: string | null;
};

export type UpdateCategoryInput = Partial<NewCategoryInput>;

export type ProductImage = {
  id: string;
  url: string;
  key: string;
  position: number;
};

export type ProductCondition = 'brand_new' | 'used_uk' | 'used_local' | 'refurbished';

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  brand_new: 'Brand New',
  used_uk: 'UK Used',
  used_local: 'Used',
  refurbished: 'Refurbished',
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  category: Category | null;
  active: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  originalPriceCents: number | null;
  condition: ProductCondition;
  stockCount: number;
  warrantyMonths: number | null;
  isAuthentic: boolean;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
};

export type NewProductInput = {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  categoryId: string;
  active: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  originalPriceCents: number | null;
  condition: ProductCondition;
  stockCount: number;
  warrantyMonths: number | null;
  isAuthentic: boolean;
  images: { url: string; key: string; position: number }[];
};

export type UpdateProductInput = Partial<NewProductInput>;

export type ProductListFilter = {
  search?: string;
  categoryIds?: string[];
  active?: boolean;
  featured?: boolean;
};

export type ProductSpec = {
  id: string;
  productId: string;
  label: string;
  value: string;
  position: number;
};

export type Review = {
  id: string;
  productId: string;
  reviewerName: string;
  rating: number;
  body: string | null;
  approved: boolean;
  createdAt: Date;
};

export type NewReviewInput = {
  productId: string;
  reviewerName: string;
  rating: number;
  body?: string | null;
};

export type TradeinRequest = {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  deviceName: string;
  deviceCondition: string;
  notes: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTradeinInput = {
  customerName: string;
  phone: string;
  email?: string | null;
  deviceName: string;
  deviceCondition: string;
  notes?: string | null;
};

export type Subscriber = {
  id: string;
  email: string;
  createdAt: Date;
};

export type AdminUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
};

export type CartLineInput = {
  productId: string;
  quantity: number;
};

export type UploadedFile = {
  url: string;
  key: string;
};
