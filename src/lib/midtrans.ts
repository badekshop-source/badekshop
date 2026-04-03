// src/lib/midtrans.ts
import midtransClient from 'midtrans-client';

// Initialize Midtrans Snap API (Client-side)
export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_MODE === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// Initialize Midtrans Core API (Server-side)
export const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_MODE === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export default {
  snap,
  core
};