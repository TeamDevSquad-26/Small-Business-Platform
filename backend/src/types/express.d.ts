import type { AuthedUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireAuth` after Firebase ID token verification. */
      user?: AuthedUser;
    }
  }
}

export {};
