'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { api } from '@/lib/api';
import { Service, Barber, Shop, ShopGender } from '@/lib/types';
import BookingForm from '@/components/booking/BookingForm';
import Loading from '@/components/ui/Loading';

function getGenderTheme(gender: ShopGender) {
  switch (gender) {
    case 'WOMEN':
      return {
        gradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
        accent: 'text-pink-600',
        bg: 'bg-pink-50',
        icon: '💅',
        badge: 'bg-pink-100 text-pink-700',
      };
    case 'UNISEX':
      return {
        gradient: 'from-violet-500 via-purple-500 to-indigo-600',
        accent: 'text-purple-600',
        bg: 'bg-purple-50',
        icon: '💈',
        badge: 'bg-purple-100 text-purple-700',
      };
    default: // MEN
      return {
        gradient: 'from-blue-500 via-blue-600 to-indigo-700',
        accent: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: '💈',
        badge: 'bg-blue-100 text-blue-700',
      };
  }
}

function getGenderLabel(gender: ShopGender, isRtl: boolean) {
  switch (gender) {
    case 'WOMEN': return isRtl ? 'نساء' : 'Femmes';
    case 'UNISEX': return isRtl ? 'مختلط' : 'Mixte';
    default: return isRtl ? 'رجال' : 'Hommes';
  }
}

export default function BookShopPage() {
  const params = useParams();
  const locale = params.locale as string;
  const shopSlug = params.shopSlug as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';

  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const shopData = await api.getShop(shopSlug);
        setShop(shopData);
        const [servicesData, barbersData] = await Promise.all([
          api.getShopServices(shopData.id),
          api.getShopBarbers(shopData.id),
        ]);
        setServices(servicesData);
        setBarbers(barbersData);
      } catch {
        setError(isRtl ? 'ما لقيناش الحانوت' : 'Salon introuvable');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shopSlug, isRtl]);

  const handleSubmit = async (data: {
    serviceId: string;
    barberId: string;
    date: string;
    timeSlot: string;
    clientName: string;
    clientPhone: string;
  }) => {
    if (!shop) return;
    setSubmitting(true);
    try {
      await api.createBooking({
        shop: shop.id,
        service: data.serviceId,
        barber: data.barberId,
        date: data.date,
        timeSlot: data.timeSlot,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
      });
      setSuccess(true);
    } catch {
      setError(isRtl ? 'صار مشكل في الحجز' : 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const theme = shop ? getGenderTheme(shop.gender) : getGenderTheme('MEN');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">{theme.icon}</p>
          <p className="text-xl text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('booking.bookingConfirmed')}</h2>
          <p className="text-gray-500">
            {isRtl ? 'راك باش تجيك رسالة تأكيد' : 'Vous recevrez un SMS de confirmation'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-3xl">{theme.icon}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}>
            {shop ? getGenderLabel(shop.gender, isRtl) : ''}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('booking.title')} {shop?.name && `- ${shop.name}`}
        </h1>
        <p className="text-gray-500">
          {isRtl ? 'اختار الخدمة والوقت المناسب' : 'Choisissez le service et le créneau'}
        </p>
      </div>

      {shop && (
        <BookingForm
          locale={locale}
          shopId={shop.id}
          services={services}
          barbers={barbers}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      )}
    </div>
  );
}
