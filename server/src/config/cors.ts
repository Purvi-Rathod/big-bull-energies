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
  origin: true, // Allow all origins - no restrictions
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allow all necessary methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-api-key', 'x-nowpayments-sig', 'x-nowpayments-signature', 'x-signature', 'signature'], // Allow all necessary headers including webhook headers
  exposedHeaders: ['Content-Length'], // Expose headers
  maxAge: 3600,
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
