// mailer.ts

/**
 * This module sets up the Nodemailer transport configuration using ElasticEmail
 * and exports it for use in sending emails. It also imports the render function
 * from @react-email/render to be used with email templates.
 */

import nodemailer from 'nodemailer'; // For sending emails via SMTP
import { render } from '@react-email/render'; // To render React email templates into HTML

// Export render function for use in email templates
export { render };

/**
 * Nodemailer transport configuration using ElasticEmail.
 * 
 * Configuration:
 * - Host: smtp.elasticemail.com
 * - Port: 2525 (STARTTLS)
 * - Email: noreply@crownbankers.com
 * 
 * Example usage:
 * 
 *   import { auth } from './mailer';
 * 
 *   const mailOptions = {
 *     from: 'noreply@crownbankers.com',
 *     to: 'recipient@example.com',
 *     subject: 'Hello!',
 *     html: '<p>This is a test email</p>',
 *   };
 * 
 *   await auth.sendMail(mailOptions);
 */
// Hardcoded email credentials for ElasticEmail
const EMAIL_USER = 'noreply@crownbankers.com';
const EMAIL_PASS = '96FFF0F28BFB8ECCCE515291CDA96AF816B4';

export const auth = nodemailer.createTransport({
  host: "smtp.elasticemail.com", // ElasticEmail SMTP server
  port: 2525,                     // ElasticEmail port
  secure: false,                  // false for port 2525 (STARTTLS)
  auth: {
    user: EMAIL_USER,             // Hardcoded email
    pass: EMAIL_PASS,             // Hardcoded password
  },
});

