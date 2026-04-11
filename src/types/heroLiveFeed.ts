/** Hero “live orders” strip — product thumbnail from each order’s first line item. */
export type HeroLiveItem = {
  orderId: string;
  shopId: string;
  shopName: string;
  productName: string;
  imageUrl: string | null;
  totalPrice: number;
  createdAt: string;
};
