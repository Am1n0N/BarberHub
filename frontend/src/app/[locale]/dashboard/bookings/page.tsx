'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { Booking } from '@/lib/types';
import { api } from '@/lib/api';
import { useShop } from '@/hooks/useShop';
import { useAuth } from '@/hooks/useAuth';
import { transformBooking } from '@/lib/transformers';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

export default function BookingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';
  const { shop, loading: shopLoading } = useShop();
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const isBarber = user?.role?.toUpperCase() === 'BARBER';

  const fetchBookings = useCallback(async () => {
    if (!shop) return;
    try {
      setLoading(true);
      const data = isBarber
        ? await api.getBarberMyBookings()
        : await api.getShopBookings(shop.id);
      setBookings((data as unknown[]).map((b) => transformBooking(b, locale)));
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [shop, locale, isBarber]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const statusLabels: Record<string, string> = isRtl
    ? { PENDING: 'يستنى', CONFIRMED: 'مأكّد', CANCELLED: 'ملغي', COMPLETED: 'كمل', NO_SHOW: 'ما جاش' }
    : { PENDING: 'En attente', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé', COMPLETED: 'Terminé', NO_SHOW: 'Absent' };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateBookingStatus(id, status);
      await fetchBookings();
    } catch {
      // Silently handle
    }
  };

  if (shopLoading || loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isBarber
            ? (isRtl ? 'الرندي-فو متاعي' : 'Mes rendez-vous')
            : t('booking.title')}
        </h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? (isRtl ? 'الكل' : 'Tous') : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {isRtl ? 'ما فمّاش رندي-فو' : 'Aucun rendez-vous'}
          </div>
        )}
        {filteredBookings.map((booking) => (
          <Card key={booking.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-lg">{booking.clientName}</p>
                <p className="text-sm text-gray-500 mt-0.5">📱 {booking.clientPhone}</p>
                <div className="flex items-center gap-3 mt-2">
                  {!isBarber && (
                    <span className="text-sm text-gray-600">✂️ {booking.barberName}</span>
                  )}
                  <span className="text-sm text-gray-600">{!isBarber ? '• ' : ''}{booking.serviceName}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge status={booking.status} label={statusLabels[booking.status]} />
                <p className="text-sm text-gray-500 mt-2">{booking.timeSlot}</p>
                {booking.depositPaid && (
                  <p className="text-xs text-green-600 mt-1">
                    {isRtl ? `عربون: ${booking.depositAmount} DT` : `Acompte: ${booking.depositAmount} DT`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              {booking.status === 'PENDING' && (
                <>
                  <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}>
                    {isRtl ? 'أكّد' : 'Confirmer'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}>
                    {isRtl ? 'ألغي' : 'Annuler'}
                  </Button>
                </>
              )}
              {booking.status === 'CONFIRMED' && (
                <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(booking.id, 'CHECKED_IN')}>
                  {isRtl ? 'أضف للصف' : 'Ajouter à la file'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
