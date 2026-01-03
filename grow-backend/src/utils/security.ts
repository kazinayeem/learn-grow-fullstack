import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Security Utilities
 * Encryption, Hashing, Token Generation
 */

// 1. Encrypt Sensitive Data
export const encryptData = (data: string, encryptionKey: string): string => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32)), // 32 bytes for AES-256
      iv
    );

    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data (both needed for decryption)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// 2. Decrypt Sensitive Data
export const decryptData = (encryptedData: string, encryptionKey: string): string => {
  try {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32)),
      iv
    );

    let decrypted = decipher.update(parts[1], 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// 3. Hash Password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

// 4. Compare Password with Hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// 5. Generate Random Token
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// 6. Generate OTP (One-Time Password)
export const generateOtp = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
};

// 7. Verify OTP with Expiry
export const verifyOtpWithExpiry = (
  providedOtp: string,
  storedOtp: string,
  createdAt: Date,
  expiryMinutes: number = 15
): boolean => {
  // Check if OTP matches
  if (providedOtp !== storedOtp) {
    return false;
  }

  // Check if OTP hasn't expired
  const now = new Date();
  const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60000);

  return now <= expiryTime;
};

// 8. Generate API Key
export const generateApiKey = (): string => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString('hex');
  return `${timestamp}${random}`.slice(0, 32);
};

// 9. Hash API Key (for storage)
export const hashApiKey = (apiKey: string): string => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

// 10. Verify API Key
export const verifyApiKey = (providedKey: string, hashedKey: string): boolean => {
  return hashApiKey(providedKey) === hashedKey;
};

// 11. Generate JWT Secret
export const generateJwtSecret = (): string => {
  return crypto.randomBytes(32).toString('base64');
};

// 12. Create CSRF Token
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// 13. Hash CSRF Token
export const hashCsrfToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// 14. Verify CSRF Token
export const verifyCsrfToken = (token: string, hashedToken: string): boolean => {
  return hashCsrfToken(token) === hashedToken;
};

// 15. Generate Verification Code
export const generateVerificationCode = (length: number = 64): string => {
  return crypto.randomBytes(length / 2).toString('hex');
};

// 16. Hash Email for Recovery
export const hashEmail = (email: string): string => {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
};

// 17. Generate Session ID
export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

// 18. Generate Refresh Token
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

// 19. Hash Refresh Token (for storage)
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// 20. Create Secure Cookie Value
export const createSecureCookie = (value: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
};

// 21. Verify Secure Cookie
export const verifySecureCookie = (value: string, signature: string, secret: string): boolean => {
  const expectedSignature = crypto.createHmac('sha256', secret).update(value).digest('hex');
  return signature === expectedSignature;
};

// 22. Password Strength Checker
export const checkPasswordStrength = (
  password: string
): {
  score: number; // 0-4
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters long');

  // Check for uppercase
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letters');

  // Check for lowercase
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letters');

  // Check for numbers
  if (/[0-9]/.test(password)) score++;
  else feedback.push('Add numbers');

  // Check for special characters
  if (/[!@#$%^&*]/.test(password)) score++;
  else feedback.push('Add special characters (!@#$%^&*)');

  return { score, feedback };
};

// 23. Generate Secure Random String
export const generateSecureRandomString = (length: number = 32): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const characterLength = characters.length;
  const randomBytes = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters[randomBytes[i] % characterLength];
  }

  return result;
};

// 24. Hash Data with Salt
export const hashDataWithSalt = (data: string, salt: string = generateToken(16)): string => {
  return {
    hash: crypto.createHash('sha256').update(data + salt).digest('hex'),
    salt,
  } as any;
};

// 25. Verify Hash with Salt
export const verifyHashWithSalt = (data: string, hash: string, salt: string): boolean => {
  const newHash = crypto.createHash('sha256').update(data + salt).digest('hex');
  return newHash === hash;
};

// 26. Generate File Upload Token
export const generateFileUploadToken = (): string => {
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
};

// 27. Verify File Upload Token (must be used within timeframe)
export const verifyFileUploadToken = (token: string, maxAgeMs: number = 3600000): boolean => {
  const timestamp = parseInt(token.split('-')[0]);
  const now = Date.now();

  return now - timestamp <= maxAgeMs;
};

// 28. Encrypt Credit Card (Basic - use tokenization in production)
export const encryptCreditCard = (cardNumber: string, encryptionKey: string): string => {
  try {
    // Store only last 4 digits
    const last4 = cardNumber.slice(-4);
    return `****${last4}`;
  } catch (error) {
    throw new Error('Failed to encrypt credit card');
  }
};

// 29. Generate Security Questions Answers Hash
export const hashSecurityAnswer = (answer: string): string => {
  return crypto
    .createHash('sha256')
    .update(answer.toLowerCase().trim())
    .digest('hex');
};

// 30. Verify Security Question Answer
export const verifySecurityAnswer = (providedAnswer: string, hashedAnswer: string): boolean => {
  return hashSecurityAnswer(providedAnswer) === hashedAnswer;
};
