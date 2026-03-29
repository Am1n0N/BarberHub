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

  // Shops
  listShops: () => fetchApi<import('./types').ShopMapItem[]>('/shops'),
  getShop: (slug: string) => fetchApi<import('./types').Shop>(`/shops/${slug}`),
  getShopServices: (shopId: string) => fetchApi<import('./types').Service[]>(`/shops/${shopId}/services`),
  getShopBarbers: (shopId: string) => fetchApi<import('./types').Barber[]>(`/shops/${shopId}/barbers`),
  updateShop: (shopId: string, data: Partial<import('./types').Shop>) =>
    fetchApi<import('./types').Shop>(`/shops/${shopId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Bookings
  createBooking: (data: Partial<import('./types').Booking>) =>
    fetchApi<import('./types').Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getShopBookings: (shopId: string) =>
    fetchApi<import('./types').Booking[]>(`/bookings/shop/${shopId}`),
  updateBookingStatus: (id: string, status: string) =>
    fetchApi<import('./types').Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Queue
  getQueue: (shopId: string) => fetchApi<import('./types').QueueEntry[]>(`/queue/shop/${shopId}`),
  addToQueue: (data: Partial<import('./types').QueueEntry>) =>
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

  // Services
  createService: (data: Partial<import('./types').Service>) =>
    fetchApi<import('./types').Service>('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id: string, data: Partial<import('./types').Service>) =>
    fetchApi<import('./types').Service>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteService: (id: string) =>
    fetchApi(`/services/${id}`, { method: 'DELETE' }),

  // Barbers
  createBarber: (data: Partial<import('./types').Barber>) =>
    fetchApi<import('./types').Barber>('/barbers', { method: 'POST', body: JSON.stringify(data) }),
  updateBarber: (id: string, data: Partial<import('./types').Barber>) =>
    fetchApi<import('./types').Barber>(`/barbers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleBarberAvailability: (id: string) =>
    fetchApi<import('./types').Barber>(`/barbers/${id}/toggle-availability`, { method: 'PATCH' }),
};
