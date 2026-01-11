import { ENV } from "./env";

export const config = {
  node_env: ENV.NODE_ENV,
  port: ENV.PORT,
  mongodb_uri: ENV.MONGODB_URI,
  jwt: {
    secret: ENV.JWT_SECRET,
    expiresIn: ENV.JWT_EXPIRES_IN,
    refreshSecret: ENV.JWT_REFRESH_SECRET,
    refreshExpiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
  },
  // Email configuration is now managed via database (SMTPConfig model)
  // No longer stored in environment variables
  twilio: {
    accountSid: ENV.TWILIO_ACCOUNT_SID,
    authToken: ENV.TWILIO_AUTH_TOKEN,
    phoneNumber: ENV.TWILIO_PHONE_NUMBER,
  },
  google: {
    clientId: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    callbackUrl: ENV.GOOGLE_CALLBACK_URL,
  },
  frontendUrl: ENV.FRONTEND_URL,
  paymentHealthUrl: ENV.PAYMENT_HEALTH_URL,
};
