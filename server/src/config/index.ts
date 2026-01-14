/**
 * Configuration Index
 * Centralized configuration exports
 */

import corsMiddleware from './cors';
export { corsOptions } from './cors';
export const cors = corsMiddleware;
export { generalLimiter, authLimiter, conditionalAuthLimiter } from './rate-limit';
export { securityHeaders } from './security';
