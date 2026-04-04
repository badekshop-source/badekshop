// src/types/index.ts
// Order status types
export type OrderStatus = 
  | 'pending'
  | 'paid' 
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'cancelled'
  | 'completed';

// KYC status types (from PRD section 5.2)
export type KycStatus = 
  | 'pending'
  | 'auto_approved'
  | 'retry_1'
  | 'retry_2'
  | 'under_review'
  | 'approved'
  | 'rejected';

// Product category
export type ProductCategory = 'esim' | 'sim_card';

// Payment methods
export type PaymentMethod = 'visa' | 'mastercard' | 'jcb' | 'amex' | 'unionpay';

// Payment status
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Refund status
export type RefundStatus = 'none' | 'requested' | 'processed';

// User roles
export type UserRole = 'customer' | 'admin';

// Product interface
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: ProductCategory;
  duration?: number; // in days for eSIM
  size?: string; // 'nano', 'micro', 'standard' for SIM cards
  price: number; // in cents
  discountPercentage?: number;
  discountStart?: string;
  discountEnd?: string;
  stock: number;
  isActive: boolean;
}

// Order interface
export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  fullName: string;
  customerEmail: string;
  customerPhone: string;
  nationality: string;
  arrivalDate: Date;
  flightNumber: string;
  productId: string;
  quantity: number;
  subtotal: number; // in cents
  discount: number; // in cents
  tax: number; // in cents
  total: number; // in cents
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentGatewayId?: string; // Midtrans transaction ID
  orderStatus: OrderStatus;
  kycStatus: KycStatus;
  kycAttempts: number;
  imeiNumber?: string; // IMEI for eSIM/SIM verification (15 digits)
  accessToken: string; // JWT token for order access
  tokenExpiresAt?: Date; // 30 days from order creation
  qrCodeData?: string; // eSIM activation code or SIM pickup info
  passportPublicId?: string; // Cloudinary public ID
  passportUrl?: string; // Cloudinary URL
  refundAmount?: number; // in cents
  refundReason?: string;
  refundStatus: RefundStatus;
  activationOutlet: string;
  notes?: string;
  expiresAt?: Date; // 2 hour payment window
  createdAt: Date;
  updatedAt: Date;
}

// Trip types for reviews
export type TripType = 'business' | 'leisure' | 'family' | 'solo';

// Trip duration for reviews
export type TripDuration = '1-3' | '4-7' | '8-14' | '15+';

// Review interface
export interface Review {
  id: string;
  orderId: string;
  userName: string;
  userEmail: string;
  country: string;
  rating: number; // 1-5
  tripType: TripType;
  tripDuration: TripDuration;
  reviewText: string;
  isApproved: boolean;
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// KYC Document interface
export interface KycDocument {
  id: string;
  orderId: string;
  passportPublicId: string; // Cloudinary public ID
  documentType: string; // Currently only 'passport'
  verificationStatus: KycStatus;
  verifiedBy?: string; // Admin who verified
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User/Profile interface
export interface Profile {
  id: string;
  email: string;
  emailVerified?: Date;
  name?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}