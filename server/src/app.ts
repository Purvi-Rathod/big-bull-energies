import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import {setupSwagger} from './swagger'
import { asyncHandler } from './utils/asyncHandler';
import { AppError } from './utils/AppError';
import { cors, securityHeaders, generalLimiter, authLimiter, conditionalAuthLimiter } from './config';
import adminRoutes from './routes/admin.routes';

const app = express();

// Security headers middleware
app.use(securityHeaders);

// Compression middleware (should be early in the stack)
app.use(compression({ level: 6, threshold: 1024 }));

// CORS configuration
app.use(cors);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

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
