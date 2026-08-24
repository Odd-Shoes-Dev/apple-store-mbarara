import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  position: z.number().int().min(0),
});

export const newProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  priceCents: z.number().int().positive(),
  currency: z.string().min(1).default("usd"),
  categoryId: z.string().min(1),
  active: z.boolean().default(true),
  images: z.array(productImageSchema).default([]),
});

export const updateProductSchema = newProductSchema.partial();

export const newCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().min(1).nullable(),
});

export const updateCategorySchema = newCategorySchema.partial();

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutRequestSchema = z.object({
  items: z.array(cartLineSchema).min(1),
});
