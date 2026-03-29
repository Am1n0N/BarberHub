export interface Shop {
  _id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  owner: string;
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

export interface Barber {
  _id: string;
  name: string;
  phone: string;
  shop: string;
  commissionRate: number;
  isAvailable: boolean;
  avatar?: string;
  createdAt: string;
}

export interface Service {
  _id: string;
  shop: string;
  name: string;
  nameFr: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Booking {
  _id: string;
  shop: string;
  client: string;
  clientName: string;
  clientPhone: string;
  barber: string;
  barberName?: string;
  service: string;
  serviceName?: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  depositAmount: number;
  depositPaid: boolean;
  createdAt: string;
}

export type QueueStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface QueueEntry {
  _id: string;
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
  _id: string;
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
  _id: string;
  name: string;
  phone: string;
  role: 'owner' | 'barber' | 'client';
  shop?: string;
}
