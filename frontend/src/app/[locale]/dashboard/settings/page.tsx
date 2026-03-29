'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { api } from '@/lib/api';
import { useShop } from '@/hooks/useShop';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';

const daysOfWeek = {
  derja: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
};

interface OpeningHour {
  day: number;
  open: string;
  close: string;
  isOpen: boolean;
}

const defaultHours: OpeningHour[] = [
  { day: 0, open: '09:00', close: '18:00', isOpen: false },
  { day: 1, open: '09:00', close: '20:00', isOpen: true },
  { day: 2, open: '09:00', close: '20:00', isOpen: true },
  { day: 3, open: '09:00', close: '20:00', isOpen: true },
  { day: 4, open: '09:00', close: '20:00', isOpen: true },
  { day: 5, open: '09:00', close: '20:00', isOpen: true },
  { day: 6, open: '09:00', close: '18:00', isOpen: true },
];

export default function SettingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';
  const days = isRtl ? daysOfWeek.derja : daysOfWeek.fr;
  const { shop, loading: shopLoading } = useShop();

  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState<OpeningHour[]>(defaultHours);

  const fetchShopData = useCallback(async () => {
    if (!shop) return;
    try {
      setLoading(true);
      const data = await api.getShop(shop.slug);
      setShopName(data.name || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setPhone(data.phone || '');
      if (data.latitude) setLatitude(String(data.latitude));
      if (data.longitude) setLongitude(String(data.longitude));
      if (data.openingHours && Array.isArray(data.openingHours)) {
        setHours(data.openingHours);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [shop]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const toggleDay = (day: number) => {
    setHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, isOpen: !h.isOpen } : h))
    );
  };

  const updateHour = (day: number, field: 'open' | 'close', value: string) => {
    setHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, [field]: value } : h))
    );
  };

  const handleSave = async () => {
    if (!shop) return;
    try {
      await api.updateShop(shop.id, {
        name: shopName,
        address,
        city,
        phone,
        openingHours: hours,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      } as Partial<import('@/lib/types').Shop>);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Silently handle
    }
  };

  const tvUrl = typeof window !== 'undefined' && shop
    ? `${window.location.origin}/${locale}/tv/${shop.slug}`
    : '';

  if (shopLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.settings')}</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 font-medium">
          ✅ {isRtl ? 'تسجّل بنجاح!' : 'Enregistré avec succès!'}
        </div>
      )}

      {/* Shop Info */}
      <Card className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isRtl ? 'معلومات الحانوت' : 'Informations du salon'}
        </h2>
        <div className="space-y-4">
          <Input
            label={t('shop.name')}
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />
          <Input
            label={t('shop.address')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('shop.city')}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label={t('shop.phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {isRtl ? '📍 موقع الحانوت في الخريطة' : '📍 Position sur la carte'}
            </p>
            <p className="text-xs text-gray-400 mb-3">
              {isRtl
                ? 'ادخل الإحداثيات باش يظهر حانوتك في خريطة الكليونات'
                : 'Renseignez les coordonnées pour apparaître sur la carte clients'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={isRtl ? 'خط العرض (Latitude)' : 'Latitude'}
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="36.8065"
              />
              <Input
                label={isRtl ? 'خط الطول (Longitude)' : 'Longitude'}
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="10.1815"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {isRtl
                ? '💡 ابحث عن اسم الحانوت في Google Maps وخذ الإحداثيات من الرابط'
                : '💡 Recherchez votre salon sur Google Maps et copiez les coordonnées depuis l\'URL'}
            </p>
          </div>
        </div>
      </Card>

      {/* Opening Hours */}
      <Card className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isRtl ? 'أوقات العمل' : 'Horaires d\'ouverture'}
        </h2>
        <div className="space-y-3">
          {hours.map((h) => (
            <div key={h.day} className="flex items-center gap-4">
              <div className="w-24">
                <span className="text-sm font-medium text-gray-700">{days[h.day]}</span>
              </div>
              <button
                onClick={() => toggleDay(h.day)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  h.isOpen ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    h.isOpen ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
              {h.isOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={h.open}
                    onChange={(e) => updateHour(h.day, 'open', e.target.value)}
                    className="px-2 py-1 rounded-lg border border-gray-300 text-sm"
                  />
                  <span className="text-gray-400">→</span>
                  <input
                    type="time"
                    value={h.close}
                    onChange={(e) => updateHour(h.day, 'close', e.target.value)}
                    className="px-2 py-1 rounded-lg border border-gray-300 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400">
                  {isRtl ? 'مسكّر' : 'Fermé'}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* TV Display URL */}
      <Card className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isRtl ? 'رابط شاشة التلفزة' : 'URL affichage TV'}
        </h2>
        <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-600 break-all">
          {tvUrl || `/${locale}/tv/${shop?.slug || 'my-shop'}`}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {isRtl
            ? 'افتح هذا الرابط على التلفزة باش يبيّن الصف'
            : "Ouvrez ce lien sur votre TV pour afficher la file d'attente"}
        </p>
      </Card>

      <Button size="lg" onClick={handleSave}>
        {t('common.save')}
      </Button>
    </div>
  );
}
