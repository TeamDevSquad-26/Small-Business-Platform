import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { HeroLiveItem } from "@/types/heroLiveFeed";

export const dynamic = "force-dynamic";

const MAX_ITEMS = 6;

export async function GET() {
  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ ok: true as const, items: [] as HeroLiveItem[] });
  }

  try {
    const orderSnap = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    type Candidate = {
      orderId: string;
      shopId: string;
      productId: string | null;
      productName: string;
      totalPrice: number;
      createdAtIso: string;
    };

    const candidates: Candidate[] = [];

    for (const doc of orderSnap.docs) {
      const x = doc.data();
      const items = Array.isArray(x.items) ? x.items : [];
      const first = items[0] as { productId?: unknown; productName?: unknown } | undefined;
      const productId =
        typeof first?.productId === "string" ? first.productId : null;
      const productName =
        typeof first?.productName === "string" ? first.productName : "Product";
      const shopId = typeof x.shopId === "string" ? x.shopId : "";
      const createdAt = x.createdAt;
      let createdAtIso = "";
      if (
        createdAt &&
        typeof createdAt === "object" &&
        "toDate" in createdAt &&
        typeof (createdAt as { toDate: () => Date }).toDate === "function"
      ) {
        createdAtIso = (createdAt as { toDate: () => Date }).toDate().toISOString();
      }
      const totalPrice =
        typeof x.totalPrice === "number"
          ? x.totalPrice
          : Number(x.totalPrice) || 0;

      if (!shopId) continue;
      candidates.push({
        orderId: doc.id,
        shopId,
        productId,
        productName,
        totalPrice,
        createdAtIso,
      });
    }

    const productIds = [
      ...new Set(
        candidates.map((c) => c.productId).filter((id): id is string => Boolean(id))
      ),
    ];

    const imageByProductId = new Map<string, string | null>();
    if (productIds.length > 0) {
      const refs = productIds.map((id) => db.collection("products").doc(id));
      const productSnaps = await db.getAll(...refs);
      for (let i = 0; i < productSnaps.length; i++) {
        const ps = productSnaps[i];
        const id = productIds[i];
        const url = ps.data()?.imageUrl;
        imageByProductId.set(
          id,
          typeof url === "string" && (url.startsWith("http") || url.startsWith("//"))
            ? url
            : null
        );
      }
    }

    const shopIds = [...new Set(candidates.map((c) => c.shopId))];
    const shopNameById = new Map<string, string>();
    await Promise.all(
      shopIds.map(async (sid) => {
        try {
          const s = await db.collection("shops").doc(sid).get();
          const n = s.data()?.shopName;
          shopNameById.set(
            sid,
            typeof n === "string" && n.trim() ? n.trim() : "Shop"
          );
        } catch {
          shopNameById.set(sid, "Shop");
        }
      })
    );

    const items: HeroLiveItem[] = candidates.slice(0, MAX_ITEMS).map((c) => ({
      orderId: c.orderId,
      shopId: c.shopId,
      shopName: shopNameById.get(c.shopId) ?? "Shop",
      productName: c.productName,
      imageUrl:
        c.productId && imageByProductId.has(c.productId)
          ? imageByProductId.get(c.productId) ?? null
          : null,
      totalPrice: c.totalPrice,
      createdAt: c.createdAtIso,
    }));

    return NextResponse.json({ ok: true as const, items });
  } catch {
    return NextResponse.json({ ok: true as const, items: [] as HeroLiveItem[] });
  }
}
