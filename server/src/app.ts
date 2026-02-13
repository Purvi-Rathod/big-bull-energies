import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import {setupSwagger} from './swagger'
import { asyncHandler } from './utils/asyncHandler';
import { AppError } from './utils/AppError';
import { cors, securityHeaders, generalLimiter, authLimiter, conditionalAuthLimiter } from './config';
import { sanitizeInput, validateObjectId } from './middleware/inputSanitization';
import adminRoutes from './routes/admin.routes';

const app = express();

// Trust proxy setting (required when behind reverse proxy/load balancer)
// This allows express-rate-limit to correctly identify client IPs
app.set('trust proxy', true);

// Security headers middleware
app.use(securityHeaders);

// Compression middleware (should be early in the stack)
app.use(compression({ level: 6, threshold: 1024 }));

// Detailed logging middleware for callback routes (applied before body parsing)
const callbackLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isCallbackRoute = req.originalUrl === '/api/v1/payment/callback' || 
                          (req.method === 'POST' && req.originalUrl === '/');
  
  if (req.method === 'POST' && isCallbackRoute) {
  
    
    // Log query parameters
    if (Object.keys(req.query).length > 0) {
      console.log(`[CALLBACK LOGGER] Query Parameters:`, JSON.stringify(req.query, null, 2));
    }
    
    // Log response when it's sent
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;
    
    res.send = function(body: any) {
      console.log(`[CALLBACK LOGGER] 📤 Response Sent`);
      console.log(`[CALLBACK LOGGER] Status Code: ${res.statusCode}`);
      console.log(`[CALLBACK LOGGER] Response Body:`, typeof body === 'string' ? body : JSON.stringify(body, null, 2));
      console.log(`${'='.repeat(80)}\n`);
      return originalSend.call(this, body);
    };
    
    res.json = function(body: any) {
      console.log(`[CALLBACK LOGGER] 📤 JSON Response Sent`);
      console.log(`[CALLBACK LOGGER] Status Code: ${res.statusCode}`);
      console.log(`[CALLBACK LOGGER] Response Body:`, JSON.stringify(body, null, 2));
      console.log(`${'='.repeat(80)}\n`);
      return originalJson.call(this, body);
    };
    
    res.end = function(chunk?: any, encoding?: any) {
      if (chunk) {
        console.log(`[CALLBACK LOGGER] 📤 Response Ended`);
        console.log(`[CALLBACK LOGGER] Status Code: ${res.statusCode}`);
      }
      return originalEnd.call(this, chunk, encoding);
    };
  }
  next();
};

// Apply logging to callback routes (before body parsing)
app.use('/api/v1/payment/callback', callbackLogger);
app.use('/', callbackLogger);

// Middleware to capture raw body for webhook signature verification (MUST be before express.json)
app.use('/api/v1/payment/callback', express.raw({ type: 'application/json', limit: '10kb' }));
// Also handle root path POST requests (fallback for misconfigured webhooks) - only for POST
app.use((req, res, next) => {
  if (req.method === 'POST' && (req.path === '/' || req.originalUrl === '/')) {
    return express.raw({ type: 'application/json', limit: '10kb' })(req, res, next);
  }
  next();
});

// Global CORS configuration - Allow all origins (no restrictions)
app.use(cors);

// SECURITY: Request size limits to prevent DoS attacks
// Helper function to check if request is a callback route
const isCallbackRoute = (req: express.Request): boolean => {
  const originalUrl = req.originalUrl || '';
  const path = req.path || '';
  return originalUrl.includes('/payment/callback') || 
         originalUrl === '/api/v1/payment/callback' ||
         path === '/callback';
};

// Helper function to check if request is root POST
const isRootPost = (req: express.Request): boolean => {
  return req.method === 'POST' && (req.path === '/' || req.originalUrl === '/');
};

// JSON parser middleware (skip for callback route and root POST which use raw body)
const jsonParser = express.json({ limit: "10kb" });
app.use((req, res, next) => {
  if (isCallbackRoute(req) || isRootPost(req)) {
    return next(); // Skip JSON parsing for callback routes (they use raw body)
  }
  jsonParser(req, res, next);
});

// URL-encoded parser middleware (skip for callback routes and root POST)
const urlencodedParser = express.urlencoded({ extended: true, limit: "10kb", parameterLimit: 100 });
app.use((req, res, next) => {
  if (isCallbackRoute(req) || isRootPost(req)) {
    return next(); // Skip URL-encoded parsing for callback routes (they use raw body)
  }
  urlencodedParser(req, res, next);
});

// Input sanitization (protect against injection attacks)
// Skip sanitization for callback routes (webhooks need exact data structure)
app.use((req, res, next) => {
  if (isCallbackRoute(req) || isRootPost(req)) {
    return next(); // Skip sanitization for callback routes (webhooks need exact data)
  }
  sanitizeInput(req, res, next);
});

// ObjectId validation middleware
// Skip validation for callback routes (webhooks don't use ObjectIds in body)
app.use((req, res, next) => {
  if (isCallbackRoute(req) || isRootPost(req)) {
    return next(); // Skip ObjectId validation for callback routes
  }
  validateObjectId(req, res, next);
});

app.use(express.static("public"));
app.use(cookieParser());

// Detailed request logging middleware (before routes)
app.use((req, res, next) => {
    const startTime = Date.now();
    
    // Log all POST requests in detail (especially for webhooks)
    if (req.method === 'POST') {
        console.log(`[REQUEST] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
        console.log(`[REQUEST] Path: ${req.path}`);
        console.log(`[REQUEST] Original URL: ${req.originalUrl}`);
        console.log(`[REQUEST] Base URL: ${req.baseUrl}`);
        console.log(`[REQUEST] Headers:`, JSON.stringify(req.headers, null, 2));
        
        // Log body if it exists (for debugging webhooks)
        if (req.body && Object.keys(req.body).length > 0) {
            console.log(`[REQUEST] Body:`, JSON.stringify(req.body, null, 2));
        }
    }

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
});


// routes
import authRoutes from './routes/auth.routes';
import treeRoutes from './routes/tree.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import galleryRoutes from './routes/gallery.routes';
// import kycRoutes from './routes/kyc.routes'; // Temporarily disabled

// Import callback handler for root path fallback
import { handlePaymentCallback } from './controllers/payment.controller';

// Apply rate limiting to specific routes
// Auth routes use conditional rate limiting (can be disabled via admin panel)
app.use("/api/v1/auth", conditionalAuthLimiter, authRoutes);
app.use("/api/v1/admin", generalLimiter, adminRoutes);
app.use("/api/v1/tree", generalLimiter, treeRoutes);
app.use("/api/v1/user", generalLimiter, userRoutes);
app.use("/api/v1/payment", generalLimiter, paymentRoutes);
app.use("/api/v1/gallery", generalLimiter, galleryRoutes);
// app.use("/api/v1/user/kyc", generalLimiter, kycRoutes); // Temporarily disabled

// Handle NOWPayments callbacks that might come to root path
// This is a fallback in case NOWPayments sends webhooks to wrong URL
// NOTE: We filter out Next.js Server Actions (multipart/form-data with next-action header)
app.post('/', asyncHandler(async (req, res, next) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[ROOT POST] 📥 POST Request Received at Root Path (/)`);
    console.log(`[ROOT POST] Timestamp: ${new Date().toISOString()}`);
    console.log(`[ROOT POST] ==========================================`);
    
    const contentType = req.headers['content-type'] || '';
    const hasNextAction = req.headers['next-action'];
    

    // Skip Next.js Server Actions (they use multipart/form-data and next-action header)
    if (contentType.includes('multipart/form-data') || hasNextAction) {
        console.log(`[ROOT POST] ⏭️ Skipping Next.js Server Action request`);
        console.log(`[ROOT POST] Reason: ${contentType.includes('multipart/form-data') ? 'multipart/form-data content-type' : 'next-action header present'}`);
        console.log(`${'='.repeat(80)}\n`);
        const response = res as any;
        return response.status(404).json({
            status: 'error',
            message: `Route ${req.method} ${req.originalUrl} not found`
        });
    }
    
    console.log(`[ROOT POST] ⚠️ Processing as potential webhook...`);
    
    // Only process JSON content-type requests as potential webhooks
    if (!contentType.includes('application/json')) {
        console.log(`[ROOT POST] ❌ Not JSON content-type (${contentType}), skipping webhook check`);
        console.log(`${'='.repeat(80)}\n`);
        const response = res as any;
        return response.status(404).json({
            status: 'error',
            message: `Route ${req.method} ${req.originalUrl} not found`
        });
    }
    
    // Parse body if it's raw Buffer
    let body = req.body || {};
    console.log(`[ROOT POST] Body Type: ${Buffer.isBuffer(req.body) ? 'Buffer (raw)' : typeof req.body}`);
    
    if (Buffer.isBuffer(req.body)) {
        const rawBodyString = req.body.toString('utf8');
        console.log(`[ROOT POST] Raw Body (first 500 chars): ${rawBodyString.substring(0, 500)}`);
        console.log(`[ROOT POST] Raw Body Length: ${rawBodyString.length} characters`);
        try {
            body = JSON.parse(rawBodyString);
            console.log(`[ROOT POST] ✅ Successfully parsed JSON from raw body`);
            console.log(`[ROOT POST] Parsed Body:`, JSON.stringify(body, null, 2));
        } catch (e: any) {
            console.error(`[ROOT POST] ❌ Failed to parse raw body:`, e.message);
            console.error(`[ROOT POST] Raw Body: ${rawBodyString}`);
            console.log(`${'='.repeat(80)}\n`);
            const response = res as any;
            return response.status(400).json({
                status: 'error',
                message: 'Invalid JSON body'
            });
        }
    } else {
        console.log(`[ROOT POST] Body (already parsed):`, JSON.stringify(body, null, 2));
    }
    
    // Check if this looks like a NOWPayments callback (check for invoice_id too, like old implementation)
    const hasPaymentId = !!body.payment_id;
    const hasInvoiceId = !!body.invoice_id;
    const hasOrderId = !!body.order_id;
    const hasPaymentStatus = !!body.payment_status;
    
    console.log(`[ROOT POST] Webhook Detection:`);
    console.log(`[ROOT POST]   - Has payment_id: ${hasPaymentId} (${body.payment_id || 'N/A'})`);
    console.log(`[ROOT POST]   - Has invoice_id: ${hasInvoiceId} (${body.invoice_id || 'N/A'})`);
    console.log(`[ROOT POST]   - Has order_id: ${hasOrderId} (${body.order_id || 'N/A'})`);
    console.log(`[ROOT POST]   - Has payment_status: ${hasPaymentStatus} (${body.payment_status || 'N/A'})`);
    
    if (hasPaymentId || hasInvoiceId || hasOrderId || hasPaymentStatus) {
        console.log(`[ROOT POST] ✅✅✅ NOWPayments CALLBACK DETECTED ✅✅✅`);
        console.log(`[ROOT POST] Payment ID: ${body.payment_id || 'N/A'}`);
        console.log(`[ROOT POST] Invoice ID: ${body.invoice_id || 'N/A'}`);
        console.log(`[ROOT POST] Order ID: ${body.order_id || 'N/A'}`);
        console.log(`[ROOT POST] Status: ${body.payment_status || 'N/A'}`);
        console.log(`[ROOT POST] Forwarding to callback handler...`);
        console.log(`${'='.repeat(80)}\n`);
        
        // Update req.body to parsed body for callback handler
        req.body = body;
        
        // Forward to the actual callback handler
        return handlePaymentCallback(req, res, next);
    }
    
    // Not a webhook, return 404
    console.log(`[ROOT POST] ❌ Not a NOWPayments callback - no payment_id, order_id, or payment_status found`);
    console.log(`[ROOT POST] Body keys: ${Object.keys(body).join(', ')}`);
    console.log(`${'='.repeat(80)}\n`);
    const response = res as any;
    response.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.originalUrl} not found. If this is a NOWPayments webhook, please check your IPN callback URL configuration. Expected: /api/v1/payment/callback`
    });
}));

app.get('/api/v1/health', asyncHandler(async (req, res) => {
    // Type assertion needed due to TypeScript type inference limitation with asyncHandler wrapper
    // The response object is correctly typed at runtime, but TypeScript needs help here
    const response = res as any;
    response.status(200);
    response.json({
        status: 'success',
        message: 'Server is running'
    });
}));

// Global error handling middleware - must be after all routes
app.use((err: Error | AppError, req, res, next: NextFunction) => {
    console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.originalUrl}:`, err);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Handle AppError instances with status codes
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(isDevelopment && { stack: err.stack })
        });
    }
    
    // Handle other errors
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

export default app
