import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Input Sanitization Middleware
 * Sanitizes and validates user inputs to prevent injection attacks
 */

/**
 * Sanitize string input - remove dangerous characters
 */
function sanitizeString(input: any): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Max length limit
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: any, depth: number = 0): any {
  // Prevent deep nesting (DoS protection)
  if (depth > 10) {
    throw new AppError('Input nesting too deep', 400);
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      // Limit number of keys (DoS protection)
      if (Object.keys(sanitized).length > 100) {
        throw new AppError('Too many input fields', 400);
      }
      
      // Sanitize key
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(obj[key], depth + 1);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Input sanitization middleware
 * Sanitizes req.body, req.query, and req.params
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    return res.status(400).json({
      status: 'error',
      message: 'Invalid input data',
    });
  }
};

/**
 * Validate MongoDB ObjectId format
 */
export const validateObjectId = (req: Request, res: Response, next: NextFunction) => {
  const { Types } = require('mongoose');
  
  // Check all params that look like IDs
  const idParams = ['id', 'userId', 'packageId', 'investmentId', 'withdrawalId', 'ticketId', 'voucherId'];
  
  for (const param of idParams) {
    if (req.params[param] && !Types.ObjectId.isValid(req.params[param])) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid ${param} format`,
      });
    }
  }
  
  next();
};
