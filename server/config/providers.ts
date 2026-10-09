import { pool } from "../adapters/db/pg/client";
import { PgProductRepository } from "../adapters/db/pg/ProductRepository.pg";
import { PgAdminUserRepository } from "../adapters/db/pg/AdminUserRepository.pg";
import { PgCategoryRepository } from "../adapters/db/pg/CategoryRepository.pg";
import { PgHeroSlideRepository } from "../adapters/db/pg/HeroSlideRepository.pg";
import { PgSpecRepository } from "../adapters/db/pg/SpecRepository.pg";
import { PgReviewRepository } from "../adapters/db/pg/ReviewRepository.pg";
import { PgTradeinRepository } from "../adapters/db/pg/TradeinRepository.pg";
import { PgRepairRequestRepository } from "../adapters/db/pg/RepairRequestRepository.pg";
import { PgStoreGalleryRepository } from "../adapters/db/pg/StoreGalleryRepository.pg";
import { PgSubscriberRepository } from "../adapters/db/pg/SubscriberRepository.pg";
import { ImageKitStorageProvider } from "../adapters/storage/imagekit";
import { StripePaymentProvider } from "../adapters/payments/stripe";
import { ProductRepository } from "../ports/ProductRepository";
import { AdminUserRepository } from "../ports/AdminUserRepository";
import { CategoryRepository } from "../ports/CategoryRepository";
import { HeroSlideRepository } from "../ports/HeroSlideRepository";
import { SpecRepository } from "../ports/SpecRepository";
import { ReviewRepository } from "../ports/ReviewRepository";
import { TradeinRepository } from "../ports/TradeinRepository";
import { RepairRequestRepository } from "../ports/RepairRequestRepository";
import { StoreGalleryRepository } from "../ports/StoreGalleryRepository";
import { SubscriberRepository } from "../ports/SubscriberRepository";
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

let heroSlideRepository: HeroSlideRepository | undefined;
export function getHeroSlideRepository(): HeroSlideRepository {
  if (!heroSlideRepository) {
    heroSlideRepository = new PgHeroSlideRepository(pool);
  }
  return heroSlideRepository;
}

let specRepository: SpecRepository | undefined;
export function getSpecRepository(): SpecRepository {
  if (!specRepository) {
    specRepository = new PgSpecRepository(pool);
  }
  return specRepository;
}

let reviewRepository: ReviewRepository | undefined;
export function getReviewRepository(): ReviewRepository {
  if (!reviewRepository) {
    reviewRepository = new PgReviewRepository(pool);
  }
  return reviewRepository;
}

let tradeinRepository: TradeinRepository | undefined;
export function getTradeinRepository(): TradeinRepository {
  if (!tradeinRepository) {
    tradeinRepository = new PgTradeinRepository(pool);
  }
  return tradeinRepository;
}

let repairRequestRepository: RepairRequestRepository | undefined;
export function getRepairRequestRepository(): RepairRequestRepository {
  if (!repairRequestRepository) {
    repairRequestRepository = new PgRepairRequestRepository(pool);
  }
  return repairRequestRepository;
}

let storeGalleryRepository: StoreGalleryRepository | undefined;
export function getStoreGalleryRepository(): StoreGalleryRepository {
  if (!storeGalleryRepository) {
    storeGalleryRepository = new PgStoreGalleryRepository(pool);
  }
  return storeGalleryRepository;
}

let subscriberRepository: SubscriberRepository | undefined;
export function getSubscriberRepository(): SubscriberRepository {
  if (!subscriberRepository) {
    subscriberRepository = new PgSubscriberRepository(pool);
  }
  return subscriberRepository;
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
