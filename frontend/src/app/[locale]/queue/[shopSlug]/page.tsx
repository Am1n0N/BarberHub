'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { api } from '@/lib/api';
import { Shop } from '@/lib/types';
import { useQueue } from '@/hooks/useQueue';
import QueueDisplay from '@/components/queue/QueueDisplay';
import EstimatedWait from '@/components/queue/EstimatedWait';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Input from '@/components/ui/Input';

export default function QueueShopPage() {
  const params = useParams();
  const locale = params.locale as string;
  const shopSlug = params.shopSlug as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';

  const [shop, setShop] = useState<Shop | null>(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [clientName, setClientName] = useState('');
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [myPosition, setMyPosition] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const shopData = await api.getShop(shopSlug);
        setShop(shopData);
      } catch {
        // Shop not found
      } finally {
        setShopLoading(false);
      }
    }
    load();
  }, [shopSlug]);

  const { activeQueue, waiting, currentlyServing, loading: queueLoading } = useQueue(shop?._id || '');

  const handleJoinQueue = async () => {
    if (!shop || !clientName.trim()) return;
    setJoining(true);
    try {
      const entry = await api.addToQueue({
        shopId: shop._id,
        clientName: clientName.trim(),
      });
      setJoined(true);
      setMyPosition(entry.position);
    } catch {
      // Handle error
    } finally {
      setJoining(false);
    }
  };

  const estimatedWait = waiting.reduce((sum, e) => sum + (e.estimatedWait || 15), 0);

  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('queue.title')}</h1>
        {shop && <p className="text-gray-500">{shop.name}</p>}
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-600 font-medium">{t('queue.currentlyServing')}</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{currentlyServing.length}</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 text-center">
          <EstimatedWait minutes={estimatedWait} locale={locale} size="lg" />
        </div>
      </div>

      {/* Joined confirmation */}
      {joined && myPosition && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <h2 className="text-xl font-bold text-green-800 mb-1">
            {isRtl ? 'دخلت للصف!' : 'Vous êtes dans la file!'}
          </h2>
          <p className="text-green-600">
            {t('queue.position')}: <span className="font-bold text-2xl">{myPosition}</span>
          </p>
        </div>
      )}

      {/* Join Queue Form */}
      {!joined && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('queue.joinQueue')}</h2>
          <div className="space-y-4">
            <Input
              label={t('queue.clientName')}
              placeholder={isRtl ? 'اكتب اسمك...' : 'Votre nom...'}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="text-lg"
            />
            <Button
              size="lg"
              className="w-full"
              onClick={handleJoinQueue}
              loading={joining}
              disabled={!clientName.trim()}
            >
              {t('queue.checkIn')} 🙋
            </Button>
          </div>
        </div>
      )}

      {/* Queue Display */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('queue.nextUp')} ({activeQueue.length})
        </h2>
        {queueLoading ? (
          <Loading text={t('common.loading')} />
        ) : (
          <QueueDisplay entries={activeQueue} locale={locale} compact />
        )}
      </div>
    </div>
  );
}
