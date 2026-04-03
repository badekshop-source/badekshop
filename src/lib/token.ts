// src/lib/token.ts
import jwt from "jsonwebtoken";
import { addDays } from "date-fns";

const JWT_SECRET = process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET || "fallback-secret-change-in-production";
const TOKEN_EXPIRY_DAYS = 30;

export interface OrderTokenPayload {
  orderId: string;
  email: string;
  orderNumber: string;
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for order access
 * Valid for 30 days from order creation
 */
export function generateOrderToken(orderId: string, email: string, orderNumber: string): string {
  const payload = {
    orderId,
    email,
    orderNumber,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${TOKEN_EXPIRY_DAYS}d`,
    issuer: "badekshop",
    audience: "order-access",
  });
}

/**
 * Verify and decode a JWT token for order access
 * Returns the decoded payload or null if invalid/expired
 */
export function verifyOrderToken(token: string): OrderTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "badekshop",
      audience: "order-access",
    }) as OrderTokenPayload;

    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Check if a token is still valid (not expired)
 */
export function isTokenValid(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET, {
      issuer: "badekshop",
      audience: "order-access",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get token expiration date
 */
export function getTokenExpiryDate(): Date {
  return addDays(new Date(), TOKEN_EXPIRY_DAYS);
}