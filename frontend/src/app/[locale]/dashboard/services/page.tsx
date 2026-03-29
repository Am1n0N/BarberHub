'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/config';
import { Service } from '@/lib/types';
import { api } from '@/lib/api';
import { useShop } from '@/hooks/useShop';
import { transformService } from '@/lib/transformers';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { formatPrice, formatDuration } from '@/lib/utils';

export default function ServicesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';
  const { shop, loading: shopLoading } = useShop();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: '', nameFr: '', price: '', duration: '' });

  const fetchServices = useCallback(async () => {
    if (!shop) return;
    try {
      setLoading(true);
      const data = await api.getShopServices(shop.id);
      setServices((data as unknown[]).map((s) => transformService(s, locale)));
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [shop, locale]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const toggleActive = async (id: string) => {
    if (!shop) return;
    const service = services.find((s) => s._id === id);
    if (!service) return;
    try {
      await api.updateService(shop.id, id, { isActive: !service.isActive } as Partial<Service>);
      await fetchServices();
    } catch {
      // Silently handle
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.nameFr || !form.price || !form.duration || !shop) return;

    try {
      if (editingService) {
        await api.updateService(shop.id, editingService._id, {
          nameDerja: form.name,
          nameFr: form.nameFr,
          price: parseFloat(form.price),
          durationMin: parseInt(form.duration),
        } as Record<string, unknown> as Partial<Service>);
      } else {
        await api.createService(shop.id, {
          nameDerja: form.name,
          nameFr: form.nameFr,
          price: parseFloat(form.price),
          durationMin: parseInt(form.duration),
        });
      }
      await fetchServices();
      closeModal();
    } catch {
      // Silently handle
    }
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      nameFr: service.nameFr,
      price: service.price.toString(),
      duration: service.duration.toString(),
    });
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditingService(null);
    setForm({ name: '', nameFr: '', price: '', duration: '' });
  };

  const handleDelete = async (id: string) => {
    if (!shop) return;
    try {
      await api.deleteService(shop.id, id);
      await fetchServices();
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
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.manageServices')}</h1>
        <Button onClick={() => setShowAdd(true)}>
          {isRtl ? '➕ أضف خدمة' : '➕ Ajouter un service'}
        </Button>
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {isRtl ? 'ما فمّاش خدمات' : 'Aucun service'}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service._id} hover>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {isRtl ? service.name : service.nameFr}
                </p>
                <p className="text-sm text-gray-500">
                  {isRtl ? service.nameFr : service.name}
                </p>
              </div>
              <Badge
                status={service.isActive ? 'COMPLETED' : 'CANCELLED'}
                label={service.isActive ? (isRtl ? 'نشط' : 'Actif') : (isRtl ? 'موقوف' : 'Inactif')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">{t('services.price')}</p>
                  <p className="font-bold text-blue-600">{formatPrice(service.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('services.duration')}</p>
                  <p className="font-medium text-gray-700">{formatDuration(service.duration, locale)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button size="sm" variant="ghost" onClick={() => openEdit(service)}>
                {isRtl ? '✏️ عدّل' : '✏️ Modifier'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleActive(service._id)}>
                {service.isActive ? (isRtl ? '⏸ وقّف' : '⏸ Désactiver') : (isRtl ? '▶ فعّل' : '▶ Activer')}
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(service._id)}>
                🗑
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAdd || !!editingService}
        onClose={closeModal}
        title={editingService ? (isRtl ? 'عدّل الخدمة' : 'Modifier le service') : (isRtl ? 'أضف خدمة' : 'Ajouter un service')}
      >
        <div className="space-y-4">
          <Input
            label={isRtl ? 'الإسم بالدارجة' : 'Nom en Derja'}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="حلاقة بسيطة"
          />
          <Input
            label={isRtl ? 'الإسم بالفرنسية' : 'Nom en français'}
            value={form.nameFr}
            onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
            placeholder="Coupe simple"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('services.price') + ' (DT)'}
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="15"
              min="0"
            />
            <Input
              label={t('services.duration') + ' (min)'}
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="20"
              min="5"
            />
          </div>
          <Button className="w-full" onClick={handleSave}>
            {isRtl ? 'سجّل' : 'Enregistrer'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
