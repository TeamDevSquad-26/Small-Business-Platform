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
  subtotal?: number;
  couponCode?: string | null;
  discountPercent?: number;
  discountAmount?: number;
  paymentMethod?: "jazzcash" | "easypaisa";
  paymentReceiver?: string;
  paymentStatus?: "pending" | "paid";
  paymentReference?: string | null;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  status: OrderStatus;
  customerEmail?: string;
  createdAt?: unknown;
};
