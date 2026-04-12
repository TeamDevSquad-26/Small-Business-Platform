/** Structured HTTP errors for consistent JSON responses */
export declare class HttpError extends Error {
    status: number;
    code?: string | undefined;
    constructor(status: number, message: string, code?: string | undefined);
}
