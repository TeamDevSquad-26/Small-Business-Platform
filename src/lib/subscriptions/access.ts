import { doc, getDoc, type Firestore } from "firebase/firestore";
import type { PlanCode, SubscriptionPlan } from "@/lib/subscriptions/plans";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans";

const LAUNCH_DATE_ISO = "2026-04-13T00:00:00.000Z";
const LAUNCH_FREE_DAYS = 30;

export type SubscriptionSnapshot = {
  selectedPlan: PlanCode;
  effectivePlan: PlanCode;
  launchFreeActive: boolean;
  launchEndsAt: Date;
};

export type PlanCaps = {
  maxProducts: number;
  couponsEnabled: boolean;
  staffSeats: number;
  advancedAnalytics: boolean;
  lowStockAlerts: boolean;
};

export const PLAN_CAPS: Record<PlanCode, PlanCaps> = {
  basic: {
    maxProducts: 50,
    couponsEnabled: false,
    staffSeats: 1,
    advancedAnalytics: false,
    lowStockAlerts: false,
  },
  standard: {
    maxProducts: 500,
    couponsEnabled: true,
    staffSeats: 1,
    advancedAnalytics: false,
    lowStockAlerts: true,
  },
  premium: {
    maxProducts: Number.POSITIVE_INFINITY,
    couponsEnabled: true,
    staffSeats: 5,
    advancedAnalytics: true,
    lowStockAlerts: true,
  },
};

export function getLaunchWindow() {
  const startsAt = new Date(LAUNCH_DATE_ISO);
  const endsAt = new Date(
    startsAt.getTime() + LAUNCH_FREE_DAYS * 24 * 60 * 60 * 1000
  );
  return { startsAt, endsAt };
}

export function isLaunchFreeActive(now = new Date()): boolean {
  const { startsAt, endsAt } = getLaunchWindow();
  return now >= startsAt && now < endsAt;
}

export function resolveEffectivePlan(selectedPlan: PlanCode): PlanCode {
  return isLaunchFreeActive() ? "premium" : selectedPlan;
}

export function resolvePlanByCode(code: PlanCode): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.code === code) ?? SUBSCRIPTION_PLANS[0]!;
}

export async function getUserSubscription(
  db: Firestore,
  uid: string
): Promise<SubscriptionSnapshot> {
  const snap = await getDoc(doc(db, "users", uid));
  const selectedRaw = snap.data()?.subscriptionPlan;
  const selectedPlan: PlanCode =
    selectedRaw === "basic" || selectedRaw === "standard" || selectedRaw === "premium"
      ? selectedRaw
      : "basic";
  const { endsAt } = getLaunchWindow();
  const launchFreeActive = isLaunchFreeActive();
  return {
    selectedPlan,
    effectivePlan: launchFreeActive ? "premium" : selectedPlan,
    launchFreeActive,
    launchEndsAt: endsAt,
  };
}
