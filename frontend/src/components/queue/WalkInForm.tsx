'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Barber, Service } from '@/lib/types';

interface WalkInFormProps {
  locale?: string;
  barbers?: Barber[];
  services?: Service[];
  onSubmit: (data: { clientName: string; barberId?: string; serviceId?: string }) => void;
  loading?: boolean;
}

export default function WalkInForm({
  locale = 'derja',
  barbers = [],
  services = [],
  onSubmit,
  loading = false,
}: WalkInFormProps) {
  const [clientName, setClientName] = useState('');
  const [barberId, setBarberId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const isRtl = locale === 'derja';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    onSubmit({
      clientName: clientName.trim(),
      barberId: barberId || undefined,
      serviceId: serviceId || undefined,
    });
    setClientName('');
    setBarberId('');
    setServiceId('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={isRtl ? 'اسم الكليون' : 'Nom du client'}
        placeholder={isRtl ? 'اكتب الإسم...' : 'Entrez le nom...'}
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        required
        className="text-lg"
      />

      {services.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {isRtl ? 'الخدمة (اختياري)' : 'Service (optionnel)'}
          </label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{isRtl ? 'اختار خدمة' : 'Choisir un service'}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {isRtl ? s.nameDerja : s.nameFr} - {s.price} DT
              </option>
            ))}
          </select>
        </div>
      )}

      {barbers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {isRtl ? 'الحجّام (اختياري)' : 'Barbier (optionnel)'}
          </label>
          <select
            value={barberId}
            onChange={(e) => setBarberId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{isRtl ? 'اختار حجّام' : 'Choisir un barbier'}</option>
            {barbers
              .filter((b) => b.isAvailable)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {isRtl ? '➕ أضف للصف' : '➕ Ajouter à la file'}
      </Button>
    </form>
  );
}
