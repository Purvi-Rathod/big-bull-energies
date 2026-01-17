import cors from 'cors';
import { CorsOptions } from 'cors';

/**
 * CORS Configuration
 * Configure allowed origins from environment variables
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'https://api.crownbankers.com'
    ];

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // SECURITY: In production, reject requests with no origin (prevents CSRF from curl/Postman)
    if (!origin) {
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true); // Allow in development for testing
      }
      return callback(new Error('Origin header required'));
    }
    
    // SECURITY: Strict origin checking
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log blocked origins for security monitoring
      console.warn(`[SECURITY] Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Only allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length'], // Minimize exposed headers
  maxAge: 3600, // SECURITY: Reduced from 24h to 1h for better security
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

export default cors(corsOptions);

/**
 * CORS Configuration for Webhooks
 * Allows requests without Origin header (for payment gateway webhooks)
 */
export const webhookCorsOptions: CorsOptions = {
  origin: true, // Allow all origins for webhooks (they may not send Origin header)
  credentials: false, // Webhooks don't need credentials
  methods: ['POST', 'GET'], // Only POST for webhooks, GET for verification
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'Accept', 'Origin', 'x-api-key'],
  exposedHeaders: ['Content-Length'],
  maxAge: 3600,
  optionsSuccessStatus: 200
};

export const webhookCors = cors(webhookCorsOptions);
