import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getDb } from "../config/firebase.js";
import { HttpError } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const createShopSchema = z.object({
  shopName: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
});

/**
 * GET /shops
 * Paginated list (public — for marketplace).
 */
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const cursor = req.query.cursor as string | undefined;

    let q = getDb()
      .collection("shops")
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (cursor) {
      const curSnap = await getDb().collection("shops").doc(cursor).get();
      if (curSnap.exists) {
        q = q.startAfter(curSnap);
      }
    }

    const snap = await q.get();
    const shops = snap.docs.map((d) => ({ shopId: d.id, ...d.data() }));
    const last = snap.docs[snap.docs.length - 1];
    return res.json({
      shops,
      nextCursor: last?.id ?? null,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /shops/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await getDb().collection("shops").doc(req.params.id).get();
    if (!doc.exists) {
      throw new HttpError(404, "Shop not found");
    }
    return res.json({ shopId: doc.id, ...doc.data() });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /shops
 * Creates a shop. First-time shop creators are promoted from `customer` → `shop_owner`.
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const body = createShopSchema.parse(req.body);
    const db = getDb();
    const uid = req.user!.uid;

    const shopRef = db.collection("shops").doc();
    const batch = db.batch();

    batch.set(shopRef, {
      shopId: shopRef.id,
      ownerId: uid,
      shopName: body.shopName,
      description: body.description ?? "",
      createdAt: FieldValue.serverTimestamp(),
    });

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const role = userSnap.data()?.role;
    if (role === "customer") {
      batch.update(userRef, { role: "shop_owner" });
    }

    await batch.commit();

    return res.status(201).json({
      message: "Shop created",
      shopId: shopRef.id,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
