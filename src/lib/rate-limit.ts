// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

// Initialize rate limiter for different actions
export const rateLimit = {
  // Upload: 5 attempts/hour per IP
  upload: new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
  }),

  // Checkout: 3 attempts/hour per session
  checkout: new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
  }),

  // Admin login: 5 attempts per 15 minutes
  adminLogin: new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
  }),
};