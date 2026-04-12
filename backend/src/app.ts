import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import cors from "cors";
import express, { type Express } from "express";
import { initFirebaseAdmin } from "./config/firebase.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import shopsRoutes from "./routes/shops.js";
import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";

function getApiBase(): string {
  const raw = process.env.API_BASE_PATH?.trim();
  if (raw !== undefined && raw !== "") {
    return raw.replace(/\/$/, "");
  }
  if (process.env.VERCEL) {
    return "/api/backend";
  }
  return "";
}

function loadBackendEnv(): void {
  const cwd = process.cwd();
  loadEnv({ path: resolve(cwd, ".env") });
  loadEnv({ path: resolve(cwd, ".env.local"), override: true });
  loadEnv({ path: resolve(cwd, "backend", ".env") });
  loadEnv({ path: resolve(cwd, "backend", ".env.local"), override: true });
}

function buildExpressApp(): Express {
  loadBackendEnv();
  initFirebaseAdmin();

  const app = express();
  const base = getApiBase();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get(base ? `${base}/health` : "/health", (_req, res) => {
    res.json({ ok: true, service: "karobaar-api" });
  });

  if (base) {
    app.use(base, authRoutes);
    app.use(`${base}/shops`, shopsRoutes);
    app.use(`${base}/products`, productsRoutes);
    app.use(`${base}/orders`, ordersRoutes);
  } else {
    app.use(authRoutes);
    app.use("/shops", shopsRoutes);
    app.use("/products", productsRoutes);
    app.use("/orders", ordersRoutes);
  }

  app.use(errorHandler);
  return app;
}

let singleton: Express | null = null;

/** Shared Express app (standalone server + Vercel Pages API). */
export function getApp(): Express {
  if (!singleton) {
    singleton = buildExpressApp();
  }
  return singleton;
}
