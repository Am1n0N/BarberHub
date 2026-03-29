'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTranslation } from '@/i18n/config';
import StatsCard from '@/components/dashboard/StatsCard';
import QueueDisplay from '@/components/queue/QueueDisplay';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import { QueueEntry } from '@/lib/types';

// Mock data for demo
const mockQueue: QueueEntry[] = [
  {
    _id: '1',
    shop: 's1',
    clientName: 'أحمد',
    barberName: 'سامي',
    serviceName: 'حلاقة بسيطة',
    position: 1,
    status: 'IN_PROGRESS',
    estimatedWait: 0,
    isWalkIn: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    shop: 's1',
    clientName: 'محمد',
    barberName: 'كريم',
    serviceName: 'لحية',
    position: 2,
    status: 'IN_PROGRESS',
    estimatedWait: 0,
    isWalkIn: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '3',
    shop: 's1',
    clientName: 'يوسف',
    position: 3,
    status: 'WAITING',
    estimatedWait: 15,
    isWalkIn: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '4',
    shop: 's1',
    clientName: 'علي',
    serviceName: 'باكاج كامل',
    position: 4,
    status: 'WAITING',
    estimatedWait: 30,
    isWalkIn: false,
    createdAt: new Date().toISOString(),
  },
];

export default function DashboardHomePage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';

  const [loading] = useState(false);
  const [queue] = useState<QueueEntry[]>(mockQueue);

  const activeCount = queue.filter((e) => e.status === 'WAITING' || e.status === 'IN_PROGRESS').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">
            {isRtl ? 'مرحبا بيك 👋' : 'Bienvenue 👋'}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/queue`}>
          <Button variant="primary">
            {isRtl ? '➕ أضف دخلة' : '➕ Walk-in'}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title={t('dashboard.todayRevenue')}
          value="245 DT"
          icon="💰"
          trend="+12%"
        />
        <StatsCard
          title={t('dashboard.todayClients')}
          value="18"
          icon="👥"
          trend="+3"
        />
        <StatsCard
          title={t('dashboard.activeQueue')}
          value={activeCount}
          icon="📋"
        />
        <StatsCard
          title={isRtl ? 'الرندي-فو اليوم' : "RDV aujourd'hui"}
          value="7"
          icon="📅"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Link href={`/${locale}/dashboard/queue`} className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 text-center transition-colors">
          <span className="text-2xl">👥</span>
          <p className="text-sm font-medium text-blue-700 mt-1">{t('dashboard.activeQueue')}</p>
        </Link>
        <Link href={`/${locale}/dashboard/barbers`} className="bg-purple-50 hover:bg-purple-100 rounded-xl p-4 text-center transition-colors">
          <span className="text-2xl">✂️</span>
          <p className="text-sm font-medium text-purple-700 mt-1">{t('dashboard.manageBarbers')}</p>
        </Link>
        <Link href={`/${locale}/dashboard/payouts`} className="bg-green-50 hover:bg-green-100 rounded-xl p-4 text-center transition-colors">
          <span className="text-2xl">💰</span>
          <p className="text-sm font-medium text-green-700 mt-1">{t('dashboard.viewPayouts')}</p>
        </Link>
        <Link href={`/${locale}/dashboard/services`} className="bg-orange-50 hover:bg-orange-100 rounded-xl p-4 text-center transition-colors">
          <span className="text-2xl">🛠</span>
          <p className="text-sm font-medium text-orange-700 mt-1">{t('dashboard.manageServices')}</p>
        </Link>
      </div>

      {/* Active Queue */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {t('dashboard.activeQueue')}
          </h2>
          <Link href={`/${locale}/dashboard/queue`}>
            <Button variant="ghost" size="sm">
              {isRtl ? 'شوف الكل' : 'Voir tout'}
            </Button>
          </Link>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <QueueDisplay entries={queue} locale={locale} compact />
        )}
      </div>
    </div>
  );
}
