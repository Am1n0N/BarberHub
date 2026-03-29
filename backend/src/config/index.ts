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
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'BarberHub <noreply@barberhub.tn>',
  },
  whatsappNotify: process.env.WHATSAPP_NOTIFY !== 'false', // enabled by default
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};
