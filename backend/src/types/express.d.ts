import type { AuthedUser } from "./auth.js";

declare module "express-serve-static-core" {
  interface Request {
    /** Set by `requireAuth` after Firebase ID token verification. */
    user?: AuthedUser;
  }
}

export {};
