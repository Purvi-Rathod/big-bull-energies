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

// Security headers middleware
app.use(securityHeaders);

// Compression middleware (should be early in the stack)
app.use(compression({ level: 6, threshold: 1024 }));

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
// JSON parser middleware (skip for callback route and root POST which use raw body)
const jsonParser = express.json({ limit: "10kb" });
app.use((req, res, next) => {
  const isCallbackRoute = req.path === '/callback' || req.originalUrl === '/api/v1/payment/callback';
  const isRootPost = req.method === 'POST' && (req.path === '/' || req.originalUrl === '/');
  
  if (isCallbackRoute || isRootPost) {
    return next(); // Skip JSON parsing for callback routes (they use raw body)
  }
  jsonParser(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: "10kb", parameterLimit: 10 })); // Limit parameters

// Input sanitization (protect against injection attacks)
app.use(sanitizeInput);

// ObjectId validation middleware
app.use(validateObjectId);

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

// Handle NOWPayments callbacks that might come to root path
// This is a fallback in case NOWPayments sends webhooks to wrong URL
app.post('/', asyncHandler(async (req, res, next) => {
    console.log(`[WEBHOOK FALLBACK] ⚠️ POST request received at root path (/)`);
    console.log(`[WEBHOOK FALLBACK] Headers:`, JSON.stringify(req.headers, null, 2));
    
    // Parse body if it's raw Buffer
    let body = req.body || {};
    if (Buffer.isBuffer(req.body)) {
        try {
            body = JSON.parse(req.body.toString('utf8'));
            console.log(`[WEBHOOK FALLBACK] Parsed raw body:`, JSON.stringify(body, null, 2));
        } catch (e) {
            console.error(`[WEBHOOK FALLBACK] Failed to parse raw body:`, e);
        }
    } else {
        console.log(`[WEBHOOK FALLBACK] Body:`, JSON.stringify(body, null, 2));
    }
    
    // Check if this looks like a NOWPayments callback
    if (body.payment_id || body.order_id || body.payment_status) {
        console.log(`[WEBHOOK FALLBACK] ✅ NOWPayments callback detected at root path (/)`);
        console.log(`[WEBHOOK FALLBACK] Payment ID: ${body.payment_id || 'N/A'}`);
        console.log(`[WEBHOOK FALLBACK] Order ID: ${body.order_id || 'N/A'}`);
        console.log(`[WEBHOOK FALLBACK] Status: ${body.payment_status || 'N/A'}`);
        console.log(`[WEBHOOK FALLBACK] Forwarding to callback handler...`);
        
        // Update req.body to parsed body for callback handler
        req.body = body;
        
        // Forward to the actual callback handler
        return handlePaymentCallback(req, res, next);
    }
    
    // Not a webhook, return 404
    console.log(`[WEBHOOK FALLBACK] ❌ Not a NOWPayments callback, returning 404`);
    const response = res as any;
    response.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.originalUrl} not found. If this is a NOWPayments webhook, please check your IPN callback URL configuration. Expected: /api/v1/payment/callback`
    });
}));

app.get('/health', asyncHandler(async (req, res) => {
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
