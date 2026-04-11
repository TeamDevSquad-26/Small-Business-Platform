export type OrderStatus = "pending" | "confirmed" | "delivered";

export type OrderItemLine = {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type OrderDoc = {
  orderId: string;
  userId: string;
  shopId: string;
  items: OrderItemLine[];
  totalPrice: number;
  status: OrderStatus;
  customerEmail?: string;
  createdAt?: unknown;
};
