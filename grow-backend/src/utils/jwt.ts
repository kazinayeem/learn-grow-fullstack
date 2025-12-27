import jwt from "jsonwebtoken";
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
  return jwt.sign(
    { id: userId, role },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );
};

/**
 * Generate Refresh Token (long-lived)
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    ENV.JWT_REFRESH_SECRET,
    { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN }
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
