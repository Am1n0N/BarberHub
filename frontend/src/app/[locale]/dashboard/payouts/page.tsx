'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { Payout } from '@/lib/types';
import { api } from '@/lib/api';
import { useShop } from '@/hooks/useShop';
import PayoutTable from '@/components/dashboard/PayoutTable';
import RevenueChart from '@/components/dashboard/RevenueChart';
import Loading from '@/components/ui/Loading';
import { formatPrice } from '@/lib/utils';

export default function PayoutsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const { shop, loading: shopLoading } = useShop();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchPayouts = useCallback(async () => {
    if (!shop) return;
    try {
      setLoading(true);
      const data = await api.getDailyPayouts(shop.id, selectedDate);
      // The backend returns an array of DailyPayoutSummary (per barber)
      // Map to the Payout[] format used by the UI
      const mappedPayouts: Payout[] = (data as unknown as Array<{
        barberId: string;
        barberName: string;
        totalRevenue: number;
        barberShare: number;
        ownerShare: number;
        completedServices: number;
      }>).map((summary) => ({
        id: summary.barberId,
        shop: shop.id,
        barber: summary.barberId,
        barberName: summary.barberName,
        date: selectedDate,
        servicesCount: summary.completedServices,
        totalRevenue: summary.totalRevenue,
        barberShare: summary.barberShare,
        ownerShare: summary.ownerShare,
        isPaid: false,
      }));
      setPayouts(mappedPayouts);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [shop, selectedDate]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const totalRevenue = payouts.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalBarberShare = payouts.reduce((sum, p) => sum + p.barberShare, 0);
  const totalOwnerShare = payouts.reduce((sum, p) => sum + p.ownerShare, 0);

  const handleMarkPaid = async (id: string) => {
    try {
      await api.markPaid(id);
      await fetchPayouts();
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
