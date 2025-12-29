/**
 * TypeScript type declarations for Express
 * Extends Express Request interface with custom properties
 */

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      role: 'buyer' | 'vendor' | 'admin';
    };
    admin?: {
      id: string;
      role: number;
      email: string;
    };
  }
}
