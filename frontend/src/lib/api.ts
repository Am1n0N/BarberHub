const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function fetchApi<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login: (phone: string, password: string) =>
    fetchApi<{ token: string; user: import('./types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),
  register: (data: { phone: string; name: string; password: string; role?: string }) =>
    fetchApi<{ token: string; user: import('./types').User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () =>
    fetchApi<import('./types').MeResponse>('/auth/me'),

  // Shops
  listShops: () => fetchApi<import('./types').ShopMapItem[]>('/shops'),
  getShop: (slug: string) => fetchApi<import('./types').Shop>(`/shops/${slug}`),
  getShopServices: (shopId: string) => fetchApi<import('./types').Service[]>(`/shops/${shopId}/services`),
  getShopBarbers: (shopId: string) => fetchApi<import('./types').Barber[]>(`/shops/${shopId}/barbers`),
  updateShop: (shopId: string, data: Partial<import('./types').Shop>) =>
    fetchApi<import('./types').Shop>(`/shops/${shopId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Bookings
  createBooking: (data: Partial<import('./types').Booking>) =>
    fetchApi<import('./types').Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getShopBookings: (shopId: string) =>
    fetchApi<import('./types').Booking[]>(`/bookings/shop/${shopId}`),
  getMyBookings: () =>
    fetchApi<import('./types').Booking[]>('/bookings/my'),
  cancelBooking: (id: string) =>
    fetchApi<import('./types').Booking>(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  updateBookingStatus: (id: string, status: string) =>
    fetchApi<import('./types').Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Queue
  getQueue: (shopId: string) => fetchApi<import('./types').QueueEntry[]>(`/queue/shop/${shopId}`),
  addToQueue: (data: { shopId: string; clientName: string; clientId?: string; barberId?: string; serviceId?: string }) =>
    fetchApi<import('./types').QueueEntry>('/queue', { method: 'POST', body: JSON.stringify(data) }),
  startService: (id: string) =>
    fetchApi<import('./types').QueueEntry>(`/queue/${id}/start`, { method: 'PATCH' }),
  completeService: (id: string) =>
    fetchApi<import('./types').QueueEntry>(`/queue/${id}/complete`, { method: 'PATCH' }),
  cancelQueueEntry: (id: string) =>
    fetchApi<import('./types').QueueEntry>(`/queue/${id}/cancel`, { method: 'PATCH' }),
  moveQueueEntry: (id: string, direction: 'up' | 'down') =>
    fetchApi<import('./types').QueueEntry>(`/queue/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ direction }),
    }),

  // Payouts
  getDailyPayouts: (shopId: string, date?: string) =>
    fetchApi<import('./types').DailyPayoutSummary>(
      `/payouts/shop/${shopId}/daily${date ? `?date=${date}` : ''}`
    ),
  markPaid: (id: string) =>
    fetchApi<import('./types').Payout>(`/payouts/${id}/mark-paid`, { method: 'POST' }),

  // Services (shop-scoped)
  createService: (shopId: string, data: { nameDerja: string; nameFr: string; price: number; durationMin?: number }) =>
    fetchApi<import('./types').Service>(`/shops/${shopId}/services`, { method: 'POST', body: JSON.stringify(data) }),
  updateService: (shopId: string, serviceId: string, data: Partial<import('./types').Service>) =>
    fetchApi<import('./types').Service>(`/shops/${shopId}/services/${serviceId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteService: (shopId: string, serviceId: string) =>
    fetchApi(`/shops/${shopId}/services/${serviceId}`, { method: 'DELETE' }),

  // Barbers (shop-scoped)
  createBarber: (shopId: string, data: { name: string; phone: string; password: string; email?: string; commissionRate?: number }) =>
    fetchApi<{ barber: import('./types').Barber; notification: { emailSent: boolean; whatsappUrl: string | null } }>(`/shops/${shopId}/barbers`, { method: 'POST', body: JSON.stringify(data) }),
  updateBarber: (shopId: string, barberId: string, data: { commissionRate?: number }) =>
    fetchApi<import('./types').Barber>(`/shops/${shopId}/barbers/${barberId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleBarberAvailability: (shopId: string, barberId: string) =>
    fetchApi<import('./types').Barber>(`/shops/${shopId}/barbers/${barberId}/toggle-availability`, { method: 'PATCH' }),

  // Barber self-service
  getBarberMyBookings: () =>
    fetchApi<import('./types').Booking[]>('/bookings/barber/my'),
  toggleMyAvailability: () =>
    fetchApi<import('./types').Barber>('/barbers/my/toggle-availability', { method: 'PATCH' }),
  getMyBarberProfile: () =>
    fetchApi<import('./types').Barber>('/barbers/my'),
  getBarberPayouts: (barberId: string, date?: string) =>
    fetchApi<import('./types').Payout[]>(`/payouts/barber/${barberId}${date ? `?date=${date}` : ''}`),

  // Admin
  adminListShops: (page = 1) =>
    fetchApi<import('./types').AdminShopsResult>(`/admin/shops?page=${page}`),
  adminCreateShop: (data: {
    ownerName: string; ownerPhone: string; ownerPassword: string;
    shopName: string; address: string; city: string; phone: string;
    latitude?: number; longitude?: number;
  }) =>
    fetchApi<{ shop: import('./types').AdminShop; user: import('./types').User }>('/admin/shops', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  adminToggleShopStatus: (id: string) =>
    fetchApi<import('./types').AdminShop>(`/admin/shops/${id}/toggle`, { method: 'PATCH' }),
  adminListRequests: (status?: string, page = 1) =>
    fetchApi<import('./types').AdminRequestsResult>(
      `/admin/requests?page=${page}${status ? `&status=${status}` : ''}`
    ),
  adminReviewRequest: (id: string, action: 'APPROVED' | 'REJECTED', opts?: { reviewNote?: string; ownerPassword?: string }) =>
    fetchApi<import('./types').ShopRequest>(`/admin/requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, ...opts }),
    }),

  // Join requests (public)
  submitJoinRequest: (data: {
    ownerName: string; ownerPhone: string; ownerEmail?: string; shopName: string;
    address: string; city: string; message?: string;
  }) =>
    fetchApi<import('./types').ShopRequest>('/join-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
