// Web override of the RevenueCat layer. react-native-purchases has no browser
// SDK, and web Pro is free (see useProStore.web.ts), so every export here is a
// no-op / always-Pro stub. Keeping the same surface means useRevenueCat.ts and
// the paywall compile and run on web without platform branches.
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

export const PRODUCT_IDS = {
  monthly: 'sp_pro_monthly',
  yearly: 'sp_pro_yearly',
} as const;

// Minimal CustomerInfo with the "pro" entitlement active so isProActive() → true.
const WEB_PRO_INFO = {
  entitlements: { active: { pro: { identifier: 'pro' } } },
} as unknown as CustomerInfo;

export async function initRevenueCat(): Promise<void> {
  // Nothing to initialize in the browser.
}

export function isProActive(_info: CustomerInfo): boolean {
  return true;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  return WEB_PRO_INFO;
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  // No purchasable offerings on web — Pro is already unlocked.
  return null;
}

export async function purchasePackage(
  _pkg: PurchasesPackage
): Promise<{ isPro: boolean }> {
  return { isPro: true };
}

export async function restorePurchases(): Promise<{ isPro: boolean }> {
  return { isPro: true };
}

export async function identifyUser(_userId: string): Promise<void> {
  // No-op on web.
}

export async function logoutUser(): Promise<void> {
  // No-op on web.
}
