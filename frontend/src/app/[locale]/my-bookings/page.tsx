'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTranslation, isRtl } from '@/i18n/config';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Booking } from '@/lib/types';
import { transformBooking } from '@/lib/transformers';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';

function getStatusLabel(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    PENDING: t('myBookings.statusPending'),
    CONFIRMED: t('myBookings.statusConfirmed'),
    DEPOSIT_PAID: t('myBookings.statusDepositPaid'),
    CHECKED_IN: t('myBookings.statusCheckedIn'),
    IN_PROGRESS: t('myBookings.statusInProgress'),
    COMPLETED: t('myBookings.statusCompleted'),
    NO_SHOW: t('myBookings.statusNoShow'),
    CANCELLED: t('myBookings.statusCancelled'),
  };
  return map[status] || status;
}

function formatDate(dateStr: string, rtl: boolean): string {
  const d = new Date(dateStr);
  if (rtl) {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MyBookingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'derja';
  const t = getTranslation(locale);
  const rtl = isRtl(locale);
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getMyBookings();
      setBookings((data as unknown[]).map((b) => transformBooking(b, locale)));
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id: string) => {
    const msg = t('myBookings.cancelConfirm');
    if (!window.confirm(msg)) return;
    setCancellingId(id);
    try {
      await api.cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' as const } : b))
      );
    } catch {
      // silently handle
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  const upcoming = bookings.filter((b) => {
    if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(b.status)) return false;
    return new Date(b.date) >= new Date(now.toISOString().split('T')[0]);
  });
  const past = bookings.filter((b) => {
    if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(b.status)) return true;
    return new Date(b.date) < new Date(now.toISOString().split('T')[0]);
  });

  if (loading) {
    return <Loading size="lg" text={t('common.loading')} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('myBookings.title')}</h1>
          <p className="text-gray-500 mt-1">
            {rtl ? `مرحبا ${user?.name ?? ''} 👋` : `Bonjour ${user?.name ?? ''} 👋`}
          </p>
        </div>
        <Link
          href={`/${locale}/map`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-sm"
        >
          <span>🗺️</span> {t('myBookings.findShop')}
        </Link>
      </div>

      {/* Upcoming bookings */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📅</span> {t('myBookings.upcoming')}
          {upcoming.length > 0 && (
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {upcoming.length}
            </span>
          )}
        </h2>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 mb-4">{t('myBookings.noUpcoming')}</p>
            <Link
              href={`/${locale}/map`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              {t('myBookings.bookNow')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                locale={locale}
                rtl={rtl}
                t={t}
                onCancel={handleCancel}
                cancelling={cancellingId === booking.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past bookings */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> {t('myBookings.past')}
        </h2>

        {past.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-gray-500">{t('myBookings.noPast')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                locale={locale}
                rtl={rtl}
                t={t}
                isPast
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BookingCard({
  booking,
  locale,
  rtl,
  t,
  onCancel,
  cancelling,
  isPast,
}: {
  booking: Booking;
  locale: string;
  rtl: boolean;
  t: (key: string) => string;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
  isPast?: boolean;
}) {
  const canCancel =
    !isPast && ['PENDING', 'CONFIRMED', 'DEPOSIT_PAID'].includes(booking.status);

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm ${isPast ? 'opacity-75' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Shop name */}
          {booking.shopName && (
            <h3 className="font-bold text-gray-900 text-lg truncate">
              🏪 {booking.shopName}
            </h3>
          )}
          {booking.shopAddress && (
            <p className="text-sm text-gray-400 truncate">{booking.shopAddress}</p>
          )}

          {/* Details */}
          <div className="mt-3 space-y-1.5">
            <p className="text-sm text-gray-700">
              <span className="text-gray-400">{rtl ? '📅' : '📅'}</span>{' '}
              {formatDate(booking.date, rtl)}{' '}
              <span className="text-gray-400">{t('myBookings.at')}</span>{' '}
              <span className="font-semibold">{booking.timeSlot}</span>
            </p>
            {booking.serviceName && (
              <p className="text-sm text-gray-700">
                <span className="text-gray-400">✂️</span> {booking.serviceName}
                {booking.servicePrice != null && (
                  <span className="text-blue-600 font-medium ml-1">
                    ({booking.servicePrice} DT)
                  </span>
                )}
              </p>
            )}
            {booking.barberName && (
              <p className="text-sm text-gray-700">
                <span className="text-gray-400">👤</span> {t('myBookings.with')}{' '}
                <span className="font-medium">{booking.barberName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right side: status + actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge status={booking.status} label={getStatusLabel(booking.status, t)} />

          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={cancelling}
              className="text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelling
                ? (rtl ? 'يستنى...' : 'Annulation...')
                : t('myBookings.cancel')}
            </button>
          )}

          {!isPast && booking.shopName && (
            <Link
              href={`/${locale}/book/${encodeURIComponent(booking.shopName.toLowerCase().replace(/\s+/g, '-'))}`}
              className="text-xs text-blue-600 hover:underline"
            >
              {rtl ? 'احجز مرّة أخرى' : 'Réserver à nouveau'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
