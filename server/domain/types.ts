export type ProductCategory = "IPHONE" | "MACBOOK" | "IPAD" | "WATCH" | "ACCESSORIES" | "OTHER";

export type ProductImage = {
  id: string;
  url: string;
  key: string;
  position: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  category: ProductCategory;
  active: boolean;
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
  category: ProductCategory;
  active: boolean;
  images: { url: string; key: string; position: number }[];
};

export type UpdateProductInput = Partial<NewProductInput>;

export type ProductListFilter = {
  search?: string;
  category?: ProductCategory;
  active?: boolean;
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
