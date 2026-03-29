'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { AdminShop } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';

interface AddShopForm {
  ownerName: string; ownerPhone: string; ownerPassword: string;
  shopName: string; address: string; city: string; phone: string;
  latitude: string; longitude: string;
}

const emptyForm: AddShopForm = {
  ownerName: '', ownerPhone: '', ownerPassword: '',
  shopName: '', address: '', city: '', phone: '',
  latitude: '', longitude: '',
};

export default function AdminShopsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRtl = locale === 'derja';

  const [shops, setShops] = useState<AdminShop[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddShopForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadShops = (p = 1) => {
    setLoading(true);
    api.adminListShops(p)
      .then((r) => { setShops(r.shops); setTotal(r.total); setPage(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadShops(1); }, []);

  const handleAdd = async () => {
    setError(null);
    if (!form.ownerName || !form.ownerPhone || !form.ownerPassword || !form.shopName || !form.address || !form.city || !form.phone) {
      setError(isRtl ? 'كمّل كل الحقول المطلوبة' : 'Remplissez tous les champs obligatoires');
      return;
    }
    setSubmitting(true);
    try {
      await api.adminCreateShop({
        ...form,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });
      setSuccess(isRtl ? '✅ الحانوت تضاف بنجاح' : '✅ Salon ajouté avec succès');
      setShowModal(false);
      setForm(emptyForm);
      loadShops(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : (isRtl ? 'صار مشكل' : 'Une erreur est survenue'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await api.adminToggleShopStatus(id);
      setShops((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: updated.isActive } : s)));
    } catch {
      // ignore
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRtl ? '💈 الحوانيت' : '💈 Salons'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} {isRtl ? 'حانوت مسجّل' : 'salon(s) enregistré(s)'}
          </p>
        </div>
        <Button onClick={() => { setShowModal(true); setError(null); setSuccess(null); }}>
          {isRtl ? '➕ أضف حانوت' : '➕ Ajouter un salon'}
        </Button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-green-700 text-sm font-medium">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loading size="lg" /></div>
      ) : (
        <>
          <div className="space-y-3">
            {shops.map((shop) => (
              <Card key={shop.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-lg">{shop.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${shop.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {shop.isActive ? (isRtl ? 'نشط' : 'Actif') : (isRtl ? 'موقوف' : 'Inactif')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">📍 {shop.address}, {shop.city}</p>
                    <p className="text-sm text-gray-500">👤 {shop.owner.name} · 📞 {shop.owner.phone}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>✂️ {shop._count.barbers} {isRtl ? 'حجّام' : 'barbier(s)'}</span>
                      <span>📅 {shop._count.bookings} {isRtl ? 'حجز' : 'réservation(s)'}</span>
                      {(shop.latitude && shop.longitude) && <span>📍 {isRtl ? 'موقع محدد' : 'Géolocalisé'}</span>}
                    </div>
                  </div>
                  <Button
                    variant={shop.isActive ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggle(shop.id)}
                  >
                    {shop.isActive ? (isRtl ? 'وقّف' : 'Désactiver') : (isRtl ? 'شغّل' : 'Activer')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => loadShops(page - 1)}>
                ←
              </Button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => loadShops(page + 1)}>
                →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add shop modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isRtl ? 'إضافة حانوت جديد' : 'Ajouter un nouveau salon'}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="border-b border-gray-100 pb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {isRtl ? 'بيانات الصاحب' : 'Propriétaire'}
            </p>
            <div className="space-y-3">
              <Input label={isRtl ? 'الاسم' : 'Nom'} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
              <Input label={isRtl ? 'التليفون' : 'Téléphone'} value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} />
              <Input label={isRtl ? 'كلمة السر' : 'Mot de passe'} type="password" value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {isRtl ? 'بيانات الحانوت' : 'Salon'}
            </p>
            <div className="space-y-3">
              <Input label={isRtl ? 'اسم الحانوت' : 'Nom du salon'} value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
              <Input label={isRtl ? 'العنوان' : 'Adresse'} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label={isRtl ? 'المدينة' : 'Ville'} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input label={isRtl ? 'التليفون' : 'Téléphone'} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Latitude" type="number" placeholder="36.8065" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                <Input label="Longitude" type="number" placeholder="10.1815" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleAdd} loading={submitting}>
              {isRtl ? '✅ أضف' : '✅ Ajouter'}
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>
              {isRtl ? 'ألغي' : 'Annuler'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
