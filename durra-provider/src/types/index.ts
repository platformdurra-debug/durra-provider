export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: "customer" | "seller" | "admin" | "warehouse" | "provider";
  createdAt: Date;
  points: number;
  level: "normal" | "gold" | "vip";
}

export interface Dress {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  size: string[];
  color: string;
  category: string;
  images: string[];
  available: boolean;
  approved: boolean;
  isVip?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

export interface Booking {
  id: string;
  customerId: string;
  dressId: string;
  sellerId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  commission: number;
  sellerAmount: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  paymentStatus: "pending" | "held" | "released" | "refunded";
  createdAt: Date;
}

// ── المزوّد ──
export interface Provider {
  id: string;
  name: string;
  type: string;
  description: string;
  area: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  coverImage?: string;
  logoImage?: string;
  available: boolean;
  approved: boolean;
  plan: "free" | "gold" | "vip";
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  workingHours?: {
    from: string;
    to: string;
    days: string[];
  };
  // حالة المحل
  status: "open" | "busy" | "closed";
  statusNote?: string; // ملاحظة مثل "مشغول حتى الساعة 8"
  ownerId?: string; // uid صاحب المحل
  createdAt: Date;
}

// ── منتج/خدمة المزوّد ──
export interface ProviderProduct {
  id: string;
  providerId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // سعر قبل الخصم
  images: string[];
  category: string;
  duration?: string; // مثل "2 ساعة" أو "يوم كامل"
  available: boolean;
  featured: boolean;
  order: number; // ترتيب العرض
  updatedAt: Date;
  createdAt: Date;
}

// ── حجز خدمة ──
export interface ServiceBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  productId?: string;
  productName?: string;
  date: Date;
  note?: string;
  totalPrice: number;
  commission: number;
  providerAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "held" | "released";
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  userName?: string;
  targetId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date;
}

export interface WarehouseItem {
  id: string;
  dressId: string;
  bookingId: string;
  status: "available" | "rented" | "cleaning" | "maintenance";
  condition: "excellent" | "good" | "fair" | "damaged";
  lastCleaned: Date;
  notes: string;
}
