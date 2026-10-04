import { createCatalogService } from "../services/catalogService";
import { createCheckoutService } from "../services/checkoutService";
import { createAuthService } from "../services/authService";
import { createCategoryService } from "../services/categoryService";
import { createSpecService } from "../services/specService";
import { createReviewService } from "../services/reviewService";
import { createTradeinService } from "../services/tradeinService";
import { createSubscriberService } from "../services/subscriberService";
import {
  getAdminUserRepository,
  getCategoryRepository,
  getPaymentProvider,
  getProductRepository,
  getSpecRepository,
  getReviewRepository,
  getTradeinRepository,
  getSubscriberRepository,
} from "./providers";

let catalogService: ReturnType<typeof createCatalogService> | undefined;
export function getCatalogService() {
  if (!catalogService) {
    catalogService = createCatalogService(getProductRepository());
  }
  return catalogService;
}

let checkoutService: ReturnType<typeof createCheckoutService> | undefined;
export function getCheckoutService() {
  if (!checkoutService) {
    checkoutService = createCheckoutService(getProductRepository(), getPaymentProvider());
  }
  return checkoutService;
}

let authService: ReturnType<typeof createAuthService> | undefined;
export function getAuthService() {
  if (!authService) {
    authService = createAuthService(getAdminUserRepository());
  }
  return authService;
}

let categoryService: ReturnType<typeof createCategoryService> | undefined;
export function getCategoryService() {
  if (!categoryService) {
    categoryService = createCategoryService(getCategoryRepository());
  }
  return categoryService;
}

let specService: ReturnType<typeof createSpecService> | undefined;
export function getSpecService() {
  if (!specService) {
    specService = createSpecService(getSpecRepository());
  }
  return specService;
}

let reviewService: ReturnType<typeof createReviewService> | undefined;
export function getReviewService() {
  if (!reviewService) {
    reviewService = createReviewService(getReviewRepository());
  }
  return reviewService;
}

let tradeinService: ReturnType<typeof createTradeinService> | undefined;
export function getTradeinService() {
  if (!tradeinService) {
    tradeinService = createTradeinService(getTradeinRepository());
  }
  return tradeinService;
}

let subscriberService: ReturnType<typeof createSubscriberService> | undefined;
export function getSubscriberService() {
  if (!subscriberService) {
    subscriberService = createSubscriberService(getSubscriberRepository());
  }
  return subscriberService;
}
