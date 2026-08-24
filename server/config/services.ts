import { createCatalogService } from "../services/catalogService";
import { createCheckoutService } from "../services/checkoutService";
import { createAuthService } from "../services/authService";
import {
  getAdminUserRepository,
  getPaymentProvider,
  getProductRepository,
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
