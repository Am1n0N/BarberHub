'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { Payout } from '@/lib/types';
import PayoutTable from '@/components/dashboard/PayoutTable';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { formatPrice } from '@/lib/utils';

const mockPayouts: Payout[] = [
  {
    _id: 'p1',
    shop: 's1',
    barber: 'b1',
    barberName: 'سامي',
    date: new Date().toISOString().split('T')[0],
    servicesCount: 8,
    totalRevenue: 120,
    barberShare: 60,
    ownerShare: 60,
    isPaid: false,
  },
  {
    _id: 'p2',
    shop: 's1',
    barber: 'b2',
    barberName: 'كريم',
    date: new Date().toISOString().split('T')[0],
    servicesCount: 6,
    totalRevenue: 95,
    barberShare: 47.5,
    ownerShare: 47.5,
    isPaid: false,
  },
  {
    _id: 'p3',
    shop: 's1',
    barber: 'b3',
    barberName: 'نبيل',
    date: new Date().toISOString().split('T')[0],
    servicesCount: 4,
    totalRevenue: 60,
    barberShare: 27,
    ownerShare: 33,
    isPaid: true,
    paidAt: new Date().toISOString(),
    paymentMethod: 'cash',
  },
];

export default function PayoutsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);

  const [payouts, setPayouts] = useState<Payout[]>(mockPayouts);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const totalRevenue = payouts.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalBarberShare = payouts.reduce((sum, p) => sum + p.barberShare, 0);
  const totalOwnerShare = payouts.reduce((sum, p) => sum + p.ownerShare, 0);

  const handleMarkPaid = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, isPaid: true, paidAt: new Date().toISOString() } : p
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('payout.title')}</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-sm text-gray-500 mb-1">{t('payout.totalRevenue')}</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-sm text-gray-500 mb-1">{t('payout.barberShare')}</p>
          <p className="text-2xl font-bold text-blue-600">{formatPrice(totalBarberShare)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-sm text-gray-500 mb-1">{t('payout.ownerShare')}</p>
          <p className="text-2xl font-bold text-green-600">{formatPrice(totalOwnerShare)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('payout.dailySummary')}</h2>
            <PayoutTable payouts={payouts} locale={locale} onMarkPaid={handleMarkPaid} />
          </div>
        </div>
        <div>
          <RevenueChart
            totalRevenue={totalRevenue}
            barberShare={totalBarberShare}
            ownerShare={totalOwnerShare}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
