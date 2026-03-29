'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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

export default function SettingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';
  const days = isRtl ? daysOfWeek.derja : daysOfWeek.fr;

  const [shopName, setShopName] = useState('حانوت سامي');
  const [address, setAddress] = useState('نهج الحبيب بورقيبة، تونس');
  const [city, setCity] = useState('تونس');
  const [phone, setPhone] = useState('71123456');
  const [saved, setSaved] = useState(false);

  const [hours, setHours] = useState<OpeningHour[]>([
    { day: 0, open: '09:00', close: '18:00', isOpen: false },
    { day: 1, open: '09:00', close: '20:00', isOpen: true },
    { day: 2, open: '09:00', close: '20:00', isOpen: true },
    { day: 3, open: '09:00', close: '20:00', isOpen: true },
    { day: 4, open: '09:00', close: '20:00', isOpen: true },
    { day: 5, open: '09:00', close: '20:00', isOpen: true },
    { day: 6, open: '09:00', close: '18:00', isOpen: true },
  ]);

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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tvUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${locale}/tv/demo-shop`
    : '';

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
          {tvUrl || `/${locale}/tv/demo-shop`}
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
