export type PlanCode = "basic" | "standard" | "premium";

export type SubscriptionPlan = {
  code: PlanCode;
  name: string;
  pricePkr: number;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    code: "basic",
    name: "Basic",
    pricePkr: 1000,
    blurb: "Best for new shops getting first online orders.",
    features: [
      "1 shop",
      "Up to 50 products",
      "Order management",
      "Basic sales summary",
      "Email support (48-72 hours)",
    ],
    cta: "Start with Basic",
  },
  {
    code: "standard",
    name: "Standard",
    pricePkr: 2000,
    blurb: "For growing businesses that need better insights.",
    features: [
      "Everything in Basic",
      "Up to 500 products",
      "Low stock alerts",
      "Discount / coupon support",
      "Priority support (24 hours)",
    ],
    cta: "Choose Standard",
    featured: true,
  },
  {
    code: "premium",
    name: "Premium",
    pricePkr: 3500,
    blurb: "For high-volume sellers and teams.",
    features: [
      "Everything in Standard",
      "Unlimited products",
      "Multi-staff access (up to 5 users)",
      "Advanced analytics and trends",
      "Fastest support and onboarding",
    ],
    cta: "Go Premium",
  },
];

export const LAUNCH_OFFER = {
  title: "Launch offer: First month free for all shops",
  detail:
    "During launch month every user gets full access to premium-level features. Paid subscriptions start after month one.",
};
