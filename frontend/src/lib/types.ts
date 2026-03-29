export interface Shop {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  owner: string;
  latitude?: number | null;
  longitude?: number | null;
  openingHours: {
    day: number;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopMapItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
}

export interface Barber {
  id: string;
  name: string;
  phone: string;
  shop: string;
  commissionRate: number;
  isAvailable: boolean;
  avatar?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  shop: string;
  nameDerja: string;
  nameFr: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Booking {
  id: string;
  shop: string;
  shopName?: string;
  shopAddress?: string;
  client: string;
  clientName: string;
  clientPhone: string;
  barber: string;
  barberName?: string;
  service: string;
  serviceName?: string;
  servicePrice?: number;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  depositAmount: number;
  depositPaid: boolean;
  createdAt: string;
}

export type QueueStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface QueueEntry {
  id: string;
  shop: string;
  client?: string;
  clientName: string;
  barber?: string;
  barberName?: string;
  service?: string;
  serviceName?: string;
  position: number;
  status: QueueStatus;
  estimatedWait: number;
  checkedInAt?: string;
  startedAt?: string;
  completedAt?: string;
  isWalkIn: boolean;
  createdAt: string;
}

export interface Payout {
  id: string;
  shop: string;
  barber: string;
  barberName: string;
  date: string;
  servicesCount: number;
  totalRevenue: number;
  barberShare: number;
  ownerShare: number;
  isPaid: boolean;
  paidAt?: string;
  paymentMethod?: string;
}

export interface DailyPayoutSummary {
  date: string;
  payouts: Payout[];
  totalRevenue: number;
  totalBarberShare: number;
  totalOwnerShare: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'owner' | 'barber' | 'client' | 'OWNER' | 'BARBER' | 'CLIENT' | 'ADMIN';
  shop?: string | { id: string; name: string; slug: string };
}

export interface MeResponse {
  id: string;
  name: string;
  phone: string;
  role: string;
  shop?: { id: string; name: string; slug: string } | null;
}

export type ShopRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ShopRequest {
  id: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  shopName: string;
  address: string;
  city: string;
  message?: string;
  status: ShopRequestStatus;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  notification?: {
    emailSent: boolean;
    whatsappUrl: string | null;
  };
}

export interface AdminShop {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  owner: { id: string; name: string; phone: string };
  _count: { barbers: number; bookings: number };
}

export interface AdminShopsResult {
  shops: AdminShop[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminRequestsResult {
  requests: ShopRequest[];
  total: number;
  page: number;
  limit: number;
}
