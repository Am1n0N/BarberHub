'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { QueueEntry, Barber, Service } from '@/lib/types';
import QueueDisplay from '@/components/queue/QueueDisplay';
import WalkInForm from '@/components/queue/WalkInForm';
import Card from '@/components/ui/Card';

const mockBarbers: Barber[] = [
  { _id: 'b1', name: 'سامي', phone: '55111111', shop: 's1', commissionRate: 50, isAvailable: true, createdAt: '' },
  { _id: 'b2', name: 'كريم', phone: '55222222', shop: 's1', commissionRate: 50, isAvailable: true, createdAt: '' },
];

const mockServices: Service[] = [
  { _id: 'sv1', shop: 's1', name: 'حلاقة بسيطة', nameFr: 'Coupe simple', price: 15, duration: 20, isActive: true },
  { _id: 'sv2', shop: 's1', name: 'لحية', nameFr: 'Taille de barbe', price: 10, duration: 15, isActive: true },
  { _id: 'sv3', shop: 's1', name: 'باكاج كامل', nameFr: 'Forfait complet', price: 30, duration: 40, isActive: true },
];

const initialQueue: QueueEntry[] = [
  { _id: '1', shop: 's1', clientName: 'أحمد', barberName: 'سامي', serviceName: 'حلاقة بسيطة', position: 1, status: 'IN_PROGRESS', estimatedWait: 0, isWalkIn: false, createdAt: '' },
  { _id: '2', shop: 's1', clientName: 'محمد', barberName: 'كريم', serviceName: 'لحية', position: 2, status: 'IN_PROGRESS', estimatedWait: 0, isWalkIn: true, createdAt: '' },
  { _id: '3', shop: 's1', clientName: 'يوسف', position: 3, status: 'WAITING', estimatedWait: 15, isWalkIn: true, createdAt: '' },
  { _id: '4', shop: 's1', clientName: 'علي', serviceName: 'باكاج كامل', position: 4, status: 'WAITING', estimatedWait: 30, isWalkIn: false, createdAt: '' },
];

export default function DashboardQueuePage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';

  const [queue, setQueue] = useState<QueueEntry[]>(initialQueue);

  const handleAddWalkIn = (data: { clientName: string; barberId?: string; serviceId?: string }) => {
    const newEntry: QueueEntry = {
      _id: `new-${Date.now()}`,
      shop: 's1',
      clientName: data.clientName,
      barberName: mockBarbers.find((b) => b._id === data.barberId)?.name,
      serviceName: mockServices.find((s) => s._id === data.serviceId)?.name,
      position: queue.length + 1,
      status: 'WAITING',
      estimatedWait: 15,
      isWalkIn: true,
      createdAt: new Date().toISOString(),
    };
    setQueue((prev) => [...prev, newEntry]);
  };

  const handleStart = (id: string) => {
    setQueue((prev) =>
      prev.map((e) => (e._id === id ? { ...e, status: 'IN_PROGRESS' as const } : e))
    );
  };

  const handleComplete = (id: string) => {
    setQueue((prev) => prev.filter((e) => e._id !== id));
  };

  const handleCancel = (id: string) => {
    setQueue((prev) => prev.filter((e) => e._id !== id));
  };

  const handleMoveUp = (id: string) => {
    setQueue((prev) => {
      const idx = prev.findIndex((e) => e._id === id);
      if (idx <= 0) return prev;
      const newQueue = [...prev];
      [newQueue[idx - 1], newQueue[idx]] = [newQueue[idx], newQueue[idx - 1]];
      return newQueue.map((e, i) => ({ ...e, position: i + 1 }));
    });
  };

  const handleMoveDown = (id: string) => {
    setQueue((prev) => {
      const idx = prev.findIndex((e) => e._id === id);
      if (idx >= prev.length - 1) return prev;
      const newQueue = [...prev];
      [newQueue[idx], newQueue[idx + 1]] = [newQueue[idx + 1], newQueue[idx]];
      return newQueue.map((e, i) => ({ ...e, position: i + 1 }));
    });
  };

  const activeQueue = queue.filter((e) => e.status === 'WAITING' || e.status === 'IN_PROGRESS');

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
              barbers={mockBarbers}
              services={mockServices}
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
