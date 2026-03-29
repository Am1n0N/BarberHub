'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { Barber } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils';

const initialBarbers: Barber[] = [
  { _id: 'b1', name: 'سامي', phone: '55111111', shop: 's1', commissionRate: 50, isAvailable: true, createdAt: '' },
  { _id: 'b2', name: 'كريم', phone: '55222222', shop: 's1', commissionRate: 50, isAvailable: true, createdAt: '' },
  { _id: 'b3', name: 'نبيل', phone: '55333333', shop: 's1', commissionRate: 45, isAvailable: false, createdAt: '' },
];

const todayEarnings: Record<string, number> = {
  b1: 120,
  b2: 95,
  b3: 0,
};

export default function BarbersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';

  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCommission, setNewCommission] = useState('50');

  const toggleAvailability = (id: string) => {
    setBarbers((prev) =>
      prev.map((b) => (b._id === id ? { ...b, isAvailable: !b.isAvailable } : b))
    );
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newBarber: Barber = {
      _id: `b-${Date.now()}`,
      name: newName,
      phone: newPhone,
      shop: 's1',
      commissionRate: parseInt(newCommission) || 50,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    };
    setBarbers((prev) => [...prev, newBarber]);
    setNewName('');
    setNewPhone('');
    setNewCommission('50');
    setShowAdd(false);
  };

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map((barber) => (
          <Card key={barber._id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {barber.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{barber.name}</p>
                  <p className="text-sm text-gray-500">{barber.phone}</p>
                </div>
              </div>
              <button
                onClick={() => toggleAvailability(barber._id)}
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
                <p className="font-bold text-gray-900">{barber.commissionRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {isRtl ? 'دخل اليوم' : "Gains aujourd'hui"}
                </p>
                <p className="font-bold text-blue-600">
                  {formatPrice(todayEarnings[barber._id] || 0)}
                </p>
              </div>
            </div>
          </Card>
        ))}
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
