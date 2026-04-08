"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Banknote,
  CreditCard,
  Plus,
  Pencil,
  ListOrdered,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const recentOrders = [
  {
    id: "#KB-1024",
    customer: "Ali Khan",
    amount: "Rs 4,200",
    status: "Paid",
    date: "Apr 5, 2026",
  },
  {
    id: "#KB-1023",
    customer: "Sara Ahmed",
    amount: "Rs 2,890",
    status: "Pending",
    date: "Apr 5, 2026",
  },
  {
    id: "#KB-1022",
    customer: "Hassan Raza",
    amount: "Rs 12,500",
    status: "Paid",
    date: "Apr 4, 2026",
  },
  {
    id: "#KB-1021",
    customer: "Fatima Noor",
    amount: "Rs 1,150",
    status: "Shipped",
    date: "Apr 4, 2026",
  },
  {
    id: "#KB-1020",
    customer: "Omar Sheikh",
    amount: "Rs 8,750",
    status: "Paid",
    date: "Apr 3, 2026",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mx-auto max-w-6xl space-y-8"
      >
        <motion.div variants={fadeSlideUp}>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 text-muted">
            Yahan aap apni shop ka snapshot dekhein — demo data hai.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            variants={fadeSlideUp}
            title="Total Products"
            value="128"
            hint="+12 this month"
            icon={Package}
            accent="green"
          />
          <StatCard
            variants={fadeSlideUp}
            title="Total Orders"
            value="342"
            hint="+8% vs last week"
            icon={ShoppingCart}
            accent="indigo"
          />
          <StatCard
            variants={fadeSlideUp}
            title="Revenue"
            value="Rs 284,900"
            hint="Last 30 days"
            icon={Banknote}
            accent="amber"
          />
          <StatCard
            variants={fadeSlideUp}
            title="Subscription"
            value="Standard"
            hint="Renews May 1"
            icon={CreditCard}
            accent="green"
          />
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div variants={fadeSlideUp} className="lg:col-span-2">
            <Card hover className="overflow-hidden p-0">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-lg font-semibold text-ink">
                  Recent Orders
                </h2>
                <p className="text-sm text-muted">Latest activity</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-muted">
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-50 transition-colors hover:bg-gray-50/80"
                      >
                        <td className="px-5 py-3 font-medium text-ink">
                          {row.id}
                        </td>
                        <td className="px-5 py-3 text-muted">{row.customer}</td>
                        <td className="px-5 py-3 text-ink">{row.amount}</td>
                        <td className="px-5 py-3">
                          <span
                            className={
                              row.status === "Paid"
                                ? "rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary"
                                : row.status === "Pending"
                                  ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                                  : "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            }
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeSlideUp}>
            <Card className="h-full">
              <h2 className="text-lg font-semibold text-ink">Quick actions</h2>
              <p className="mt-1 text-sm text-muted">
                Sabse zyada use hone wale shortcuts
              </p>
              <ul className="mt-5 space-y-2">
                <li>
                  <Link
                    href="/dashboard/products"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-background px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-secondary/30 hover:bg-secondary/5"
                  >
                    <Plus className="h-4 w-4 text-secondary" />
                    Add Product
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/create-shop"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-background px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-secondary/30 hover:bg-secondary/5"
                  >
                    <Pencil className="h-4 w-4 text-secondary" />
                    Edit Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/orders"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-background px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-secondary/30 hover:bg-secondary/5"
                  >
                    <ListOrdered className="h-4 w-4 text-secondary" />
                    View Orders
                  </Link>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
