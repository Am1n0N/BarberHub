import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: jwtSecret || 'default-dev-secret-do-not-use-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  flouciAppToken: process.env.FLOUCI_APP_TOKEN || '',
  flouciAppSecret: process.env.FLOUCI_APP_SECRET || '',
  konnectApiKey: process.env.KONNECT_API_KEY || '',
};
