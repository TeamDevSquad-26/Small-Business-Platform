export type Role = "customer" | "shop_owner" | "admin";

export type AuthedUser = {
  uid: string;
  email: string;
  role: Role;
  name?: string;
};
