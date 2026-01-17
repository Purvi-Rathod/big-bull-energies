import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import {setupSwagger} from './swagger'
import { asyncHandler } from './utils/asyncHandler';
import { AppError } from './utils/AppError';
import { cors, webhookCors, securityHeaders, generalLimiter, authLimiter, conditionalAuthLimiter } from './config';
import { sanitizeInput, validateObjectId } from './middleware/inputSanitization';
import adminRoutes from './routes/admin.routes';

const app = express();

// Security headers middleware
app.use(securityHeaders);

// Compression middleware (should be early in the stack)
app.use(compression({ level: 6, threshold: 1024 }));

// CORS configuration - apply webhook CORS for payment callbacks BEFORE global CORS
app.use('/api/v1/payment/callback', webhookCors);

// Middleware to capture raw body for webhook signature verification (MUST be before express.json)
app.use('/api/v1/payment/callback', express.raw({ type: 'application/json', limit: '10kb' }));

// Global CORS configuration (skip callback route - it uses webhookCors above)
app.use((req, res, next) => {
  // Skip CORS for payment callback route (uses webhookCors instead)
  // Check both originalUrl (full path) and path (relative to mount point)
  const isCallbackRoute = req.originalUrl && req.originalUrl.includes('/payment/callback');
  
  if (isCallbackRoute) {
    console.log(`[CORS] Skipping global CORS for callback route: ${req.originalUrl}`);
    return next();
  }
  cors(req, res, next);
});

// SECURITY: Request size limits to prevent DoS attacks
// JSON parser middleware (skip for callback route which uses raw body)
const jsonParser = express.json({ limit: "10kb" });
app.use((req, res, next) => {
  if (req.path === '/api/v1/payment/callback' || req.originalUrl === '/api/v1/payment/callback') {
    return next(); // Skip JSON parsing for callback route
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

app.use((req, res, next) => {
    const startTime = Date.now();

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

// Apply rate limiting to specific routes
// Auth routes use conditional rate limiting (can be disabled via admin panel)
app.use("/api/v1/auth", conditionalAuthLimiter, authRoutes);
app.use("/api/v1/admin", generalLimiter, adminRoutes);
app.use("/api/v1/tree", generalLimiter, treeRoutes);
app.use("/api/v1/user", generalLimiter, userRoutes);
app.use("/api/v1/payment", generalLimiter, paymentRoutes);
app.use("/api/v1/gallery", generalLimiter, galleryRoutes);

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
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

export default app
