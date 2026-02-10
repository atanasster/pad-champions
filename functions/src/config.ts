/**
 * Shared configuration for Cloud Functions
 */

export const corsOptions = [
  'http://localhost:3001',
  'https://pad-champions.web.app',
  'https://pad-champions.firebaseapp.com',
];

// Reusable options object for onCall functions
export const defaultCallOpts = {
  cors: true,
};
