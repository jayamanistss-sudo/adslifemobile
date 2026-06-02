export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  city?: string;
  avatar_url?: string;
  streak_days?: number;
  coins?: number;
}

export interface Offer {
  id: number;
  vendorId: number;
  title: string;
  description?: string;
  category?: string;
  discountPercent: number;
  originalPrice?: number;
  offerPrice?: number;
  imageUrl?: string;
  couponCode?: string;
  redeemUrl?: string;
  maxRedemptions: number;
  currentRedemptions: number;
  validFrom?: string;
  validUntil?: string;
  isActive: number;
  isFeatured: number;
  views: number;
  clicks: number;
  saves: number;
  createdAt?: string;
  businessName?: string;
  vendorLogo?: string;
  vendorCity?: string;
  vendorAddress?: string;
  vendorPhone?: string;
  vendorWebsite?: string;
  vendorLat?: number;
  vendorLng?: number;
  vendorCategory?: string;
  vendorDescription?: string;
  distance?: number;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  type: string;
  offerId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface Vendor {
  id: number;
  business_name: string;
  category: string;
  city: string;
  address?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  description?: string;
  status: string;
  total_followers: number;
  subscription_plan: string;
  lat?: number;
  lng?: number;
}
