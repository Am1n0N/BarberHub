'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { Barber } from '@/lib/types';
import { api } from '@/lib/api';
import { useShop } from '@/hooks/useShop';
import { transformBarber } from '@/lib/transformers';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import { formatPrice } from '@/lib/utils';

export default function BarbersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';
  const { shop, loading: shopLoading } = useShop();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCommission, setNewCommission] = useState('50');

  const fetchBarbers = useCallback(async () => {
    if (!shop) return;
    try {
      setLoading(true);
      const data = await api.getShopBarbers(shop.id);
      setBarbers((data as unknown[]).map((b) => transformBarber(b)));
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [shop]);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  const toggleAvailability = async (id: string) => {
    if (!shop) return;
    try {
      await api.toggleBarberAvailability(shop.id, id);
      await fetchBarbers();
    } catch {
      // Silently handle
    }
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newPhone.trim() || !newPassword.trim() || !shop) return;
    try {
      // First register the barber user, then add to shop
      const { user } = await api.register({
        phone: newPhone,
        name: newName,
        password: newPassword,
        role: 'BARBER',
      });
      await api.createBarber(shop.id, {
        userId: user.id,
        commissionRate: (parseInt(newCommission) || 50) / 100,
      });
      await fetchBarbers();
      setNewName('');
      setNewPhone('');
      setNewPassword('');
      setNewCommission('50');
      setShowAdd(false);
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
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.manageBarbers')}
        </h1>
        <Button onClick={() => setShowAdd(true)}>
          {isRtl ? '➕ أضف حجّام' : '➕ Ajouter un barbier'}
        </Button>
      </div>

      {barbers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {isRtl ? 'ما فمّاش حجّامين' : 'Aucun barbier'}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map((barber) => {
          const barberName = barber.name || 'Unknown';
          const barberPhone = barber.phone || '';
          return (
            <Card key={barber.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {barberName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{barberName}</p>
                    <p className="text-sm text-gray-500">{barberPhone}</p>
                  </div>
                </div>
              <button
                onClick={() => toggleAvailability(barber.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  barber.isAvailable
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {barber.isAvailable
                  ? (isRtl ? 'متوفّر' : 'Disponible')
                  : (isRtl ? 'غير متوفّر' : 'Indisponible')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {isRtl ? 'نسبة العمولة' : 'Commission'}
                </p>
                <p className="font-bold text-gray-900">{Math.round(barber.commissionRate * 100)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {isRtl ? 'الحالة' : 'Statut'}
                </p>
                <p className="font-bold text-blue-600">
                  {barber.isAvailable
                    ? (isRtl ? 'نشط' : 'Actif')
                    : (isRtl ? 'غير نشط' : 'Inactif')}
                </p>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      {/* Add Barber Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={isRtl ? 'أضف حجّام جديد' : 'Ajouter un barbier'}>
        <div className="space-y-4">
          <Input
            label={isRtl ? 'الإسم' : 'Nom'}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={isRtl ? 'اكتب إسم الحجّام' : 'Nom du barbier'}
          />
          <Input
            label={isRtl ? 'التليفون' : 'Téléphone'}
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="55 XXX XXX"
          />
          <Input
            label={isRtl ? 'كلمة السر' : 'Mot de passe'}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={isRtl ? 'كلمة سر الحجّام' : 'Mot de passe du barbier'}
          />
          <Input
            label={isRtl ? 'نسبة العمولة (%)' : 'Commission (%)'}
            type="number"
            value={newCommission}
            onChange={(e) => setNewCommission(e.target.value)}
            min="0"
            max="100"
          />
          <Button className="w-full" onClick={handleAdd}>
            {isRtl ? 'أضف' : 'Ajouter'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
