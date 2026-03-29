'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function BarberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';
  const { user } = useAuth();

  const [isAvailable, setIsAvailable] = useState(user?.barber?.isAvailable ?? true);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);

  // Redirect non-barbers away
  useEffect(() => {
    if (user && user.role?.toUpperCase() !== 'BARBER') {
      router.replace(`/${locale}/dashboard`);
    }
  }, [user, locale, router]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const barber = await api.getMyBarberProfile();
      setIsAvailable(barber.isAvailable);
    } catch {
      // Silently handle — use cached value from auth
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleToggleAvailability = async () => {
    setToggling(true);
    try {
      const updated = await api.toggleMyAvailability();
      setIsAvailable(updated.isAvailable);
    } catch {
      // Silently handle
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <Loading />;

  const commissionPct = user?.barber ? Math.round(user.barber.commissionRate * 100) : 50;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isRtl ? 'حسابي' : 'Mon profil'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isRtl ? 'معلوماتك وإعداداتك' : 'Vos informations et paramètres'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        {/* Identity card */}
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">
                {isRtl ? 'حجّام' : 'Barbier'}
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>{user?.phone}</span>
            </div>
            {user?.email && (
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>{user.email}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Commission card */}
        <Card>
          <p className="text-sm text-gray-500 mb-1">
            {isRtl ? 'نسبة العمولة' : 'Taux de commission'}
          </p>
          <p className="text-4xl font-bold text-blue-600">{commissionPct}%</p>
          <p className="text-xs text-gray-400 mt-2">
            {isRtl
              ? 'نسبة حقّك من كل خدمة'
              : 'Votre part sur chaque service réalisé'}
          </p>
        </Card>

        {/* Availability toggle */}
        <Card className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                {isRtl ? 'حالة التوفّر' : 'Statut de disponibilité'}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {isAvailable
                  ? (isRtl ? 'أنت متوفّر تقبّل كليونات' : 'Vous acceptez des clients')
                  : (isRtl ? 'أنت مو متوفّر تو' : 'Vous êtes indisponible')}
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={toggling}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                isAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  isAvailable ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleToggleAvailability}
              disabled={toggling}
              variant={isAvailable ? 'danger' : 'primary'}
              className="w-full"
            >
              {toggling
                ? (isRtl ? 'يبدّل...' : 'Mise à jour...')
                : isAvailable
                  ? (isRtl ? 'حط روحك غير متوفّر' : 'Me mettre indisponible')
                  : (isRtl ? 'ارجع متوفّر' : 'Me remettre disponible')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
