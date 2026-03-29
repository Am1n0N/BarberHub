'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { Booking } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const mockBookings: Booking[] = [
  {
    _id: '1',
    shop: 's1',
    client: 'c1',
    clientName: 'أحمد بن صالح',
    clientPhone: '55123456',
    barber: 'b1',
    barberName: 'سامي',
    service: 'sv1',
    serviceName: 'حلاقة بسيطة',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00',
    status: 'CONFIRMED',
    depositAmount: 5,
    depositPaid: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    shop: 's1',
    client: 'c2',
    clientName: 'محمد العربي',
    clientPhone: '55789012',
    barber: 'b2',
    barberName: 'كريم',
    service: 'sv2',
    serviceName: 'باكاج كامل',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:30',
    status: 'PENDING',
    depositAmount: 10,
    depositPaid: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '3',
    shop: 's1',
    client: 'c3',
    clientName: 'يوسف',
    clientPhone: '55345678',
    barber: 'b1',
    barberName: 'سامي',
    service: 'sv1',
    serviceName: 'لحية',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '14:00',
    status: 'CONFIRMED',
    depositAmount: 0,
    depositPaid: false,
    createdAt: new Date().toISOString(),
  },
];

export default function BookingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';

  const [bookings] = useState<Booking[]>(mockBookings);
  const [filter, setFilter] = useState<string>('all');

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const statusLabels: Record<string, string> = isRtl
    ? { PENDING: 'يستنى', CONFIRMED: 'مأكّد', CANCELLED: 'ملغي', COMPLETED: 'كمل', NO_SHOW: 'ما جاش' }
    : { PENDING: 'En attente', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé', COMPLETED: 'Terminé', NO_SHOW: 'Absent' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('booking.title')}</h1>
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
        {filteredBookings.map((booking) => (
          <Card key={booking._id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-lg">{booking.clientName}</p>
                <p className="text-sm text-gray-500 mt-0.5">📱 {booking.clientPhone}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-gray-600">✂️ {booking.barberName}</span>
                  <span className="text-sm text-gray-600">• {booking.serviceName}</span>
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
                  <Button size="sm" variant="primary">
                    {isRtl ? 'أكّد' : 'Confirmer'}
                  </Button>
                  <Button size="sm" variant="danger">
                    {isRtl ? 'ألغي' : 'Annuler'}
                  </Button>
                </>
              )}
              {booking.status === 'CONFIRMED' && (
                <Button size="sm" variant="primary">
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
