import crypto from 'crypto';
import validator from 'validator';

/**
 * Input Sanitization & Validation Utilities
 * Prevents XSS, SQL/NoSQL injection, and other attacks
 */

// 1. HTML Sanitization (Remove potentially dangerous HTML)
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// 2. XSS Attack Prevention
export const preventXSS = (data: any): any => {
  if (typeof data === 'string') {
    return sanitizeHtml(data);
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = Array.isArray(data) ? [] : {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = preventXSS(data[key]);
      }
    }

    return sanitized;
  }

  return data;
};

// 3. NoSQL Injection Prevention
export const preventNoSqlInjection = (query: any): any => {
  if (typeof query === 'string') {
    // Remove $ and . which are used in MongoDB operators
    return query.replace(/[\$\.]/g, '');
  }

  if (typeof query === 'object' && query !== null) {
    const sanitized: any = {};

    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        // Don't allow keys starting with $
        if (!key.startsWith('$')) {
          sanitized[key] = preventNoSqlInjection(query[key]);
        }
      }
    }

    return sanitized;
  }

  return query;
};

// 4. Email Validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// 5. URL Validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 6. Phone Number Validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// 7. Prevent Command Injection
export const preventCommandInjection = (input: string): string => {
  // Remove shell special characters
  const dangerousChars = ['`', '$', '&&', '||', ';', '|', '>', '<', '&', '*', '?', '{', '}'];

  let sanitized = input;
  dangerousChars.forEach(char => {
    sanitized = sanitized.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
  });

  return sanitized;
};

// 8. Path Traversal Prevention
export const preventPathTraversal = (filePath: string): string => {
  // Remove ../ and other path traversal attempts
  let sanitized = filePath
    .replace(/\.\.\//g, '')
    .replace(/\.\.\\/g, '')
    .replace(/\.\.%2f/gi, '')
    .replace(/\.\.%5c/gi, '');

  // Ensure path starts with expected directory
  return sanitized.startsWith('/') ? sanitized : `/${sanitized}`;
};

// 9. JSON Validation
export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// 10. String Length Validation
export const isValidLength = (str: string, min: number = 0, max: number = 10000): boolean => {
  return str.length >= min && str.length <= max;
};

// 11. Numeric Validation
export const isValidNumber = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// 12. Integer Validation
export const isValidInteger = (value: any): boolean => {
  return Number.isInteger(value);
};

// 13. UUID Validation
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// 14. MongoDB ObjectID Validation
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// 15. Enum Validation
export const isValidEnum = (value: any, allowedValues: any[]): boolean => {
  return allowedValues.includes(value);
};

// 16. Range Validation
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// 17. Safe JSON Stringify (prevent circular references)
export const safeJsonStringify = (obj: any): string => {
  const seen = new WeakSet();

  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  });
};

// 18. Sanitize User Input Object
export const sanitizeInput = (input: any): any => {
  return preventXSS(preventNoSqlInjection(input));
};

// 19. URL Encode
export const urlEncode = (str: string): string => {
  return encodeURIComponent(str);
};

// 20. URL Decode (Safe)
export const urlDecode = (str: string): string => {
  try {
    return decodeURIComponent(str);
  } catch {
    return str; // Return original if decoding fails
  }
};

// 21. Base64 Encode
export const base64Encode = (str: string): string => {
  return Buffer.from(str).toString('base64');
};

// 22. Base64 Decode (Safe)
export const base64Decode = (str: string): string => {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return ''; // Return empty if decoding fails
  }
};

// 23. HMAC Signature Verification
export const verifyHmacSignature = (
  data: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean => {
  const expectedSignature = crypto
    .createHmac(algorithm, secret)
    .update(data)
    .digest('hex');

  return expectedSignature === signature;
};

// 24. Generate HMAC Signature
export const generateHmacSignature = (
  data: string,
  secret: string,
  algorithm: string = 'sha256'
): string => {
  return crypto.createHmac(algorithm, secret).update(data).digest('hex');
};

// 25. Generate Random Token
export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// 26. Hash Password (use bcrypt instead in production)
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// 27. Compare Password Hash
export const comparePasswordHash = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// 28. Sanitize Object for Logging (remove sensitive data)
export const sanitizeForLogging = (obj: any): any => {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'creditCard',
    'ssn',
    'apiKey',
    'privateKey',
    'accessToken',
    'refreshToken',
  ];

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
};

// 29. Rate Limit by Key
export const createRateLimitByKey = (maxAttempts: number = 5, windowMs: number = 60000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (key: string): boolean => {
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || record.resetTime < now) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true; // Allow
    }

    if (record.count >= maxAttempts) {
      return false; // Deny
    }

    record.count++;
    return true; // Allow
  };
};

// 30. Validate Content-Type
export const isValidContentType = (contentType: string, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => contentType.includes(type));
};
