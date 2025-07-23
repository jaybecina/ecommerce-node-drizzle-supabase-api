import 'express';

declare module 'express' {
  // eslint-disable-next-line no-unused-vars
  interface Request {
    /** Used by validation middleware to store cleaned request body */
    cleanBody?: any;

    /** Raw body buffer, required for Stripe webhook signature verification */
    rawBody?: Buffer;

    /** Authenticated user information, set by auth middleware */
    user?: {
      id: string;
      email: string;
      roles: string[];
      permissions: string[];
    };
  }
}
