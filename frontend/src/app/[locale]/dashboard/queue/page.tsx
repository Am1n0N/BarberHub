'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { QueueEntry, Barber, Service } from '@/lib/types';
import { api } from '@/lib/api';
import { useShop } from '@/hooks/useShop';
import { transformQueueEntry, transformBarber, transformService } from '@/lib/transformers';
import QueueDisplay from '@/components/queue/QueueDisplay';
import WalkInForm from '@/components/queue/WalkInForm';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

export default function DashboardQueuePage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';
  const { shop, loading: shopLoading } = useShop();

  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!shop) return;
    try {
      setLoading(true);
      const [queueData, barbersData, servicesData] = await Promise.all([
        api.getQueue(shop.id),
        api.getShopBarbers(shop.id),
        api.getShopServices(shop.id),
      ]);
      setQueue((queueData as unknown[]).map((e) => transformQueueEntry(e, locale)));
      setBarbers((barbersData as unknown[]).map((b) => transformBarber(b)));
      setServices((servicesData as unknown[]).map((s) => transformService(s, locale)));
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [shop, locale]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddWalkIn = async (data: { clientName: string; barberId?: string; serviceId?: string }) => {
    if (!shop) return;
    try {
      await api.addToQueue({
        shopId: shop.id,
        clientName: data.clientName,
        barberId: data.barberId,
        serviceId: data.serviceId,
      });
      await fetchData();
    } catch {
      // Silently handle
    }
  };

  const handleStart = async (id: string) => {
    try {
      await api.startService(id);
      await fetchData();
    } catch {
      // Silently handle
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.completeService(id);
      await fetchData();
    } catch {
      // Silently handle
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelQueueEntry(id);
      await fetchData();
    } catch {
      // Silently handle
    }
  };

  const handleMoveUp = async (id: string) => {
    try {
      await api.moveQueueEntry(id, 'up');
      await fetchData();
    } catch {
      // Silently handle
    }
  };

  const handleMoveDown = async (id: string) => {
    try {
      await api.moveQueueEntry(id, 'down');
      await fetchData();
    } catch {
      // Silently handle
    }
  };

  const activeQueue = queue.filter((e) => e.status === 'WAITING' || e.status === 'IN_PROGRESS');

  if (shopLoading || loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('queue.title')}</h1>
        <div className="flex gap-2">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {activeQueue.length} {isRtl ? 'في الصف' : 'dans la file'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Walk-in Form */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('queue.walkIn')}
            </h2>
            <WalkInForm
              locale={locale}
              barbers={barbers}
              services={services}
              onSubmit={handleAddWalkIn}
            />
          </Card>
        </div>

        {/* Queue */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {isRtl ? 'الصف الحالي' : 'File active'}
            </h2>
            <QueueDisplay
              entries={activeQueue}
              locale={locale}
              showActions
              onStart={handleStart}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
