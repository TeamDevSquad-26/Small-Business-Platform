import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import cors from "cors";

const cwd = process.cwd();
loadEnv({ path: resolve(cwd, ".env") });
loadEnv({ path: resolve(cwd, ".env.local"), override: true });
import express from "express";
import { initFirebaseAdmin } from "./config/firebase.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import shopsRoutes from "./routes/shops.js";
import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";

initFirebaseAdmin();

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "karobaar-api" });
});

app.use(authRoutes);
app.use("/shops", shopsRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);

app.use(errorHandler);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Karobaar API listening on http://localhost:${port}`);
});
