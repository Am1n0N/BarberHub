'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { getTranslation } from '@/i18n/config';
import { api } from '@/lib/api';
import { Shop, QueueEntry } from '@/lib/types';
import { getSocket, joinTvRoom } from '@/lib/socket';
import Badge from '@/components/ui/Badge';

export default function TvDisplayPage() {
  const params = useParams();
  const locale = params.locale as string;
  const shopSlug = params.shopSlug as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';

  const [shop, setShop] = useState<Shop | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bookingUrl, setBookingUrl] = useState('');

  useEffect(() => {
    setBookingUrl(`${window.location.origin}/${locale}/book/${shopSlug}`);
  }, [locale, shopSlug]);

  useEffect(() => {
    async function load() {
      try {
        const shopData = await api.getShop(shopSlug);
        setShop(shopData);
        const queueData = await api.getQueue(shopData.id);
        setQueue(queueData);

        joinTvRoom(shopData.id);
        const socket = getSocket();

        socket.on('queue:update', (updatedQueue: QueueEntry[]) => {
          setQueue(updatedQueue);
        });

        return () => {
          socket.off('queue:update');
        };
      } catch {
        // Shop not found
      }
    }
    load();
  }, [shopSlug]);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const inProgress = queue.filter((e) => e.status === 'IN_PROGRESS');
  const waiting = queue.filter((e) => e.status === 'WAITING').slice(0, 5);

  return (
    <div className="tv-display min-h-screen text-white no-scrollbar overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">💈</span>
          </div>
          <div>
            <p className="text-blue-200 text-sm">{t('tv.welcomeTo')}</p>
            <h1 className="text-3xl font-bold">{shop?.name || 'BarberHub'}</h1>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold font-mono">
            {currentTime.toLocaleTimeString(isRtl ? 'ar-TN' : 'fr-TN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-blue-200 text-sm">
            {currentTime.toLocaleDateString(isRtl ? 'ar-TN' : 'fr-TN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0" style={{ height: 'calc(100vh - 100px)' }}>
        {/* Currently Serving - Left/Right side */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold text-blue-300 mb-6 flex items-center gap-3">
            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            {t('tv.nowServing')}
          </h2>
          <div className="space-y-6">
            {inProgress.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-6xl mb-4">✂️</p>
                <p className="text-xl text-gray-400">
                  {isRtl ? 'ما فمّا حد يتخدم تو' : 'Personne en cours'}
                </p>
              </div>
            ) : (
              inProgress.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gradient-to-r from-green-600/20 to-green-500/10 border border-green-500/30 rounded-2xl p-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold text-white mb-2">{entry.clientName}</p>
                      {entry.barberName && (
                        <p className="text-green-300 text-lg">✂️ {entry.barberName}</p>
                      )}
                      {entry.serviceName && (
                        <p className="text-gray-400 text-base mt-1">{entry.serviceName}</p>
                      )}
                    </div>
                    <Badge status="IN_PROGRESS" label={isRtl ? 'يتخدم' : 'En cours'} className="text-lg px-4 py-2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Waiting List - Right/Left side */}
        <div className="w-1/2 bg-white/5 p-8">
          <h2 className="text-2xl font-bold text-yellow-300 mb-6 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            {t('tv.waitingList')} ({waiting.length})
          </h2>
          <div className="space-y-4">
            {waiting.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-6xl mb-4">🎉</p>
                <p className="text-xl text-gray-400">
                  {isRtl ? 'ما فمّا حد يستنى' : 'Personne en attente'}
                </p>
              </div>
            ) : (
              waiting.map((entry, i) => (
                <div
                  key={entry.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-6"
                >
                  <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-yellow-300">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-semibold text-white">{entry.clientName}</p>
                    {entry.barberName && (
                      <p className="text-gray-400">✂️ {entry.barberName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-300 text-lg font-medium">
                      ~{entry.estimatedWait || 15} {isRtl ? 'د' : 'min'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* QR Code area */}
          <div className="mt-8 bg-white/10 rounded-2xl p-6 text-center">
            <p className="text-lg text-gray-300 mb-4">{t('tv.scanToBook')}</p>
            {bookingUrl ? (
              <div className="bg-white rounded-xl p-3 w-fit mx-auto">
                <QRCodeSVG value={bookingUrl} size={128} />
              </div>
            ) : (
              <div className="w-32 h-32 bg-white/20 rounded-xl mx-auto animate-pulse" />
            )}
            <p className="text-sm text-gray-400 mt-3">{bookingUrl || `.../${shopSlug}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
