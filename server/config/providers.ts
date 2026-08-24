import { pool } from "../adapters/db/pg/client";
import { PgProductRepository } from "../adapters/db/pg/ProductRepository.pg";
import { PgAdminUserRepository } from "../adapters/db/pg/AdminUserRepository.pg";
import { PgCategoryRepository } from "../adapters/db/pg/CategoryRepository.pg";
import { ImageKitStorageProvider } from "../adapters/storage/imagekit";
import { StripePaymentProvider } from "../adapters/payments/stripe";
import { ProductRepository } from "../ports/ProductRepository";
import { AdminUserRepository } from "../ports/AdminUserRepository";
import { CategoryRepository } from "../ports/CategoryRepository";
import { StorageProvider } from "../ports/StorageProvider";
import { PaymentProvider } from "../ports/PaymentProvider";

// The only file allowed to import concrete adapter classes (server/adapters/**).
// Everything else (services, pages, API routes) should go through the getters below.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

let productRepository: ProductRepository | undefined;
export function getProductRepository(): ProductRepository {
  if (!productRepository) {
    productRepository = new PgProductRepository(pool);
  }
  return productRepository;
}

let adminUserRepository: AdminUserRepository | undefined;
export function getAdminUserRepository(): AdminUserRepository {
  if (!adminUserRepository) {
    adminUserRepository = new PgAdminUserRepository(pool);
  }
  return adminUserRepository;
}

let categoryRepository: CategoryRepository | undefined;
export function getCategoryRepository(): CategoryRepository {
  if (!categoryRepository) {
    categoryRepository = new PgCategoryRepository(pool);
  }
  return categoryRepository;
}

let storageProvider: StorageProvider | undefined;
export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    storageProvider = new ImageKitStorageProvider(
      requireEnv("IMAGEKIT_PRIVATE_KEY"),
      requireEnv("IMAGEKIT_APP_FOLDER")
    );
  }
  return storageProvider;
}

let paymentProvider: PaymentProvider | undefined;
export function getPaymentProvider(): PaymentProvider {
  if (!paymentProvider) {
    const providerName = process.env.PAYMENT_PROVIDER ?? "stripe";
    switch (providerName) {
      case "stripe":
        paymentProvider = new StripePaymentProvider(requireEnv("STRIPE_SECRET"));
        break;
      default:
        throw new Error(`Unknown PAYMENT_PROVIDER: ${providerName}`);
    }
  }
  return paymentProvider;
}
