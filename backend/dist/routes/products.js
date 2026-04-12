import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getDb } from "../config/firebase.js";
import { HttpError } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
const createProductSchema = z.object({
    shopId: z.string().min(1),
    name: z.string().min(1).max(200),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
});
const updateProductSchema = createProductSchema.partial().omit({ shopId: true });
async function assertShopOwner(shopId, uid, allowAdmin, userRole) {
    if (allowAdmin && userRole === "admin")
        return;
    const shop = await getDb().collection("shops").doc(shopId).get();
    if (!shop.exists)
        throw new HttpError(404, "Shop not found");
    const ownerId = shop.data()?.ownerId;
    if (ownerId !== uid) {
        throw new HttpError(403, "You can only manage products for your own shop");
    }
}
/**
 * GET /products/:shopId
 * List products for a shop (public catalog).
 */
router.get("/:shopId", async (req, res, next) => {
    try {
        const shopId = req.params.shopId;
        const limit = Math.min(Number(req.query.limit) || 50, 200);
        const snap = await getDb()
            .collection("products")
            .where("shopId", "==", shopId)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();
        const products = snap.docs.map((d) => ({ productId: d.id, ...d.data() }));
        return res.json({ shopId, products });
    }
    catch (e) {
        next(e);
    }
});
/**
 * POST /products
 */
router.post("/", requireAuth, async (req, res, next) => {
    try {
        const body = createProductSchema.parse(req.body);
        await assertShopOwner(body.shopId, req.user.uid, true, req.user.role);
        const ref = getDb().collection("products").doc();
        await ref.set({
            productId: ref.id,
            shopId: body.shopId,
            name: body.name,
            price: body.price,
            stock: body.stock,
            imageUrl: body.imageUrl || "",
            createdAt: FieldValue.serverTimestamp(),
        });
        return res.status(201).json({ message: "Product created", productId: ref.id });
    }
    catch (e) {
        next(e);
    }
});
/**
 * PUT /products/:id
 */
router.put("/:id", requireAuth, async (req, res, next) => {
    try {
        const productId = req.params.id;
        const body = updateProductSchema.parse(req.body);
        const ref = getDb().collection("products").doc(productId);
        const doc = await ref.get();
        if (!doc.exists)
            throw new HttpError(404, "Product not found");
        const shopId = doc.data()?.shopId;
        await assertShopOwner(shopId, req.user.uid, true, req.user.role);
        const updates = {};
        if (body.name !== undefined)
            updates.name = body.name;
        if (body.price !== undefined)
            updates.price = body.price;
        if (body.stock !== undefined)
            updates.stock = body.stock;
        if (body.imageUrl !== undefined)
            updates.imageUrl = body.imageUrl;
        if (Object.keys(updates).length === 0) {
            throw new HttpError(400, "No fields to update");
        }
        await ref.update(updates);
        return res.json({ message: "Product updated", productId });
    }
    catch (e) {
        next(e);
    }
});
/**
 * DELETE /products/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
        const productId = req.params.id;
        const ref = getDb().collection("products").doc(productId);
        const doc = await ref.get();
        if (!doc.exists)
            throw new HttpError(404, "Product not found");
        const shopId = doc.data()?.shopId;
        await assertShopOwner(shopId, req.user.uid, true, req.user.role);
        await ref.delete();
        return res.json({ message: "Product deleted", productId });
    }
    catch (e) {
        next(e);
    }
});
export default router;
