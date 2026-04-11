import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getDb } from "../config/firebase.js";
import { HttpError } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  shopId: z.string().min(1),
  products: z.array(orderItemSchema).min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "delivered"]),
});

/**
 * POST /orders
 * Customer checkout: validates stock, computes total, decrements stock in a transaction.
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);
    const db = getDb();
    const customerId = req.user!.uid;

    if (req.user!.role === "admin") {
      // Admin can still place test orders if needed; no block
    }

    const orderRef = db.collection("orders").doc();

    await db.runTransaction(async (tx) => {
      const shopRef = db.collection("shops").doc(body.shopId);
      const shopSnap = await tx.get(shopRef);
      if (!shopSnap.exists) {
        throw new HttpError(404, "Shop not found");
      }

      // Firestore requires all reads before any writes inside a transaction.
      const productRefs = body.products.map((line) => ({
        line,
        ref: db.collection("products").doc(line.productId),
      }));
      const productSnaps = await Promise.all(productRefs.map(({ ref }) => tx.get(ref)));

      let total = 0;
      const lineItems: { productId: string; quantity: number; unitPrice: number }[] = [];

      for (let i = 0; i < productRefs.length; i++) {
        const { line } = productRefs[i]!;
        const pSnap = productSnaps[i]!;
        if (!pSnap.exists) {
          throw new HttpError(400, `Product not found: ${line.productId}`);
        }
        const pdata = pSnap.data()!;
        if (pdata.shopId !== body.shopId) {
          throw new HttpError(400, `Product ${line.productId} does not belong to this shop`);
        }
        const stock = pdata.stock as number;
        if (stock < line.quantity) {
          throw new HttpError(400, `Insufficient stock for ${String(pdata.name ?? line.productId)}`);
        }
        const price = pdata.price as number;
        total += price * line.quantity;
        lineItems.push({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: price,
        });
      }

      for (let i = 0; i < productRefs.length; i++) {
        const { line, ref } = productRefs[i]!;
        const pSnap = productSnaps[i]!;
        const pdata = pSnap.data()!;
        const stock = pdata.stock as number;
        tx.update(ref, { stock: stock - line.quantity });
      }

      tx.set(orderRef, {
        orderId: orderRef.id,
        userId: customerId,
        shopId: body.shopId,
        products: lineItems.map(({ productId, quantity }) => ({ productId, quantity })),
        totalPrice: total,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return res.status(201).json({
      message: "Order placed",
      orderId: orderRef.id,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /orders/user/:userId
 */
router.get("/user/:userId", requireAuth, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (req.user!.uid !== userId && req.user!.role !== "admin") {
      throw new HttpError(403, "You can only view your own orders");
    }

    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const snap = await getDb()
      .collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const orders = snap.docs.map((d) => ({ orderId: d.id, ...d.data() }));
    return res.json({ userId, orders });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /orders/shop/:shopId
 */
router.get("/shop/:shopId", requireAuth, async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const shop = await getDb().collection("shops").doc(shopId).get();
    if (!shop.exists) throw new HttpError(404, "Shop not found");

    const ownerId = shop.data()?.ownerId as string;
    if (req.user!.uid !== ownerId && req.user!.role !== "admin") {
      throw new HttpError(403, "You can only view orders for your own shop");
    }

    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const snap = await getDb()
      .collection("orders")
      .where("shopId", "==", shopId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const orders = snap.docs.map((d) => ({ orderId: d.id, ...d.data() }));
    return res.json({ shopId, orders });
  } catch (e) {
    next(e);
  }
});

/**
 * PUT /orders/:id
 * Shop owner or admin updates status.
 */
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const body = updateStatusSchema.parse(req.body);
    const db = getDb();

    const ref = db.collection("orders").doc(orderId);
    const doc = await ref.get();
    if (!doc.exists) throw new HttpError(404, "Order not found");

    const shopId = doc.data()?.shopId as string;
    const shop = await db.collection("shops").doc(shopId).get();
    const ownerId = shop.data()?.ownerId as string;

    if (req.user!.role !== "admin" && req.user!.uid !== ownerId) {
      throw new HttpError(403, "Only the shop owner or admin can update order status");
    }

    await ref.update({ status: body.status });
    return res.json({ message: "Order updated", orderId, status: body.status });
  } catch (e) {
    next(e);
  }
});

export default router;
