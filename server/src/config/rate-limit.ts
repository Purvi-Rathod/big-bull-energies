import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiting Configuration
 */

/**
 * General API Rate Limiter
 * Limits each IP to 300 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: { 
    status: 'error', 
    message: 'Too many requests from this IP, please try again later.' 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Auth Endpoint Rate Limiter
 * Stricter limits to prevent brute force attacks
 * Limits each IP to 30 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs for auth endpoints
  message: { 
    status: 'error', 
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all attempts for security
});

/**
 * Conditional Rate Limiter Middleware
 * Checks Settings to see if rate limiting is enabled before applying limits
 */
export const conditionalAuthLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { Settings } = await import('../models/Settings');
    const setting = await Settings.findOne({ key: 'auth_rate_limiting_enabled' });
    
    // Default to enabled if setting doesn't exist (for security)
    const isEnabled = setting ? (setting.value === true || setting.value === 'true') : true;
    
    if (isEnabled) {
      // Apply rate limiting
      return authLimiter(req, res, next);
    } else {
      // Skip rate limiting
      return next();
    }
  } catch (error) {
    // On error, apply rate limiting for safety
    console.error('Error checking rate limiting setting:', error);
    return authLimiter(req, res, next);
  }
};
