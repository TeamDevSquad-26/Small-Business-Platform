import type { NextFunction, Request, Response } from "express";
/**
 * Verifies Firebase ID token and loads role from Firestore `users/{uid}`.
 */
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireAdmin(req: Request, _res: Response, next: NextFunction): void;
export declare function requireShopOwnerOrAdmin(req: Request, _res: Response, next: NextFunction): void;
