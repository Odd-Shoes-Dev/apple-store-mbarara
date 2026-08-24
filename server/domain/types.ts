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

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  category: Category | null;
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
  categoryId: string;
  active: boolean;
  images: { url: string; key: string; position: number }[];
};

export type UpdateProductInput = Partial<NewProductInput>;

export type ProductListFilter = {
  search?: string;
  categoryIds?: string[];
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
