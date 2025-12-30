import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { ENV } from "@/config/env";

export interface TokenPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate Access Token (short-lived)
 */
export const generateAccessToken = (userId: string, role: string): string => {
  const options = {
    expiresIn: String(ENV.JWT_EXPIRES_IN),
  };
  return jwt.sign(
    { id: userId, role },
    String(ENV.JWT_SECRET),
    options as SignOptions
  );
};

/**
 * Generate Refresh Token (long-lived)
 */
export const generateRefreshToken = (userId: string): string => {
  const options = {
    expiresIn: String(ENV.JWT_REFRESH_EXPIRES_IN),
  };
  return jwt.sign(
    { id: userId },
    String(ENV.JWT_REFRESH_SECRET),
    options as SignOptions
  );
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET) as { id: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Generate both tokens
 */
export const generateTokens = (
  userId: string,
  role: string
): { accessToken: string; refreshToken: string } => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);

  return { accessToken, refreshToken };
};
