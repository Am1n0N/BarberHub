'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface JoinForm {
  ownerName: string;
  ownerPhone: string;
  shopName: string;
  address: string;
  city: string;
  message: string;
}

const emptyForm: JoinForm = {
  ownerName: '',
  ownerPhone: '',
  shopName: '',
  address: '',
  city: '',
  message: '',
};

export default function JoinPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRtl = locale === 'derja';

  const [form, setForm] = useState<JoinForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!form.ownerName || !form.ownerPhone || !form.shopName || !form.address || !form.city) {
      setError(isRtl ? 'كمّل كل الحقول المطلوبة' : 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitJoinRequest({
        ...form,
        message: form.message || undefined,
      });
      setSubmitted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('already exists')) {
        setError(
          isRtl
            ? 'عندك طلب موجود بالفعل. فريقنا باش يراجعه قريبًا'
            : 'Une demande existe déjà pour ce numéro. Notre équipe vous contactera bientôt'
        );
      } else {
        setError(isRtl ? 'صار مشكل. جرّب مرة أخرى' : 'Une erreur est survenue. Réessayez plus tard');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-7xl mb-6">🎉</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {isRtl ? 'طلبك وصلنا!' : 'Demande envoyée\u00a0!'}
          </h2>
          <p className="text-gray-600 mb-2">
            {isRtl
              ? 'شكرًا! فريقنا باش يراجع طلبك ويتصل بيك قريبًا على نمرة التليفون اللي حطّيتها.'
              : 'Merci\u00a0! Notre équipe va examiner votre demande et vous contacter bientôt au numéro fourni.'}
          </p>
          <p className="text-gray-400 text-sm mb-8">
            {isRtl ? '📞 ' + form.ownerPhone : '📞 ' + form.ownerPhone}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            {isRtl ? 'ارجع للصفحة الرئيسية' : "Retour à l'accueil"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
            <span className="text-xl">💈</span>
            <span className="text-blue-700 font-semibold text-sm">BarberHub</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isRtl ? 'انضم لـ BarberHub' : 'Rejoignez BarberHub'}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            {isRtl
              ? 'سجّل حانوتك واستمتع بنظام حجوزات وصف انتظار ذكي مجاناً'
              : 'Inscrivez votre salon et bénéficiez d\'un système de réservation et de file d\'attente intelligent'}
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(isRtl
            ? [
                { icon: '📅', text: 'حجوزات أوتوماتيك' },
                { icon: '👥', text: 'صف ذكي' },
                { icon: '💰', text: 'حساب يومي' },
              ]
            : [
                { icon: '📅', text: 'Réservations auto' },
                { icon: '👥', text: 'File intelligente' },
                { icon: '💰', text: 'Calcul quotidien' },
              ]
          ).map((b) => (
            <div key={b.text} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
              <p className="text-2xl mb-1">{b.icon}</p>
              <p className="text-xs font-medium text-gray-700">{b.text}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            {isRtl ? 'معلومات الطلب' : 'Informations de la demande'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {isRtl ? 'بياناتك' : 'Vos informations'}
              </p>
              <div className="space-y-3">
                <Input
                  label={isRtl ? 'اسمك الكامل *' : 'Votre nom complet *'}
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder={isRtl ? 'مثلاً: محمد بن سالم' : 'Ex : Ahmed Ben Salem'}
                />
                <Input
                  label={isRtl ? 'نمرة التليفون *' : 'Numéro de téléphone *'}
                  type="tel"
                  value={form.ownerPhone}
                  onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                  placeholder={isRtl ? 'مثلاً: 55123456' : 'Ex : 55 123 456'}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {isRtl ? 'بيانات الحانوت' : 'Informations du salon'}
              </p>
              <div className="space-y-3">
                <Input
                  label={isRtl ? 'اسم الحانوت *' : 'Nom du salon *'}
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                  placeholder={isRtl ? 'مثلاً: حانوت سامي' : 'Ex : Salon de Sami'}
                />
                <Input
                  label={isRtl ? 'العنوان *' : 'Adresse *'}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder={isRtl ? 'مثلاً: نهج الحرية، تونس' : 'Ex : Rue de la Liberté, Tunis'}
                />
                <Input
                  label={isRtl ? 'المدينة *' : 'Ville *'}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder={isRtl ? 'مثلاً: تونس' : 'Ex : Tunis'}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isRtl ? 'رسالة إضافية (اختياري)' : 'Message supplémentaire (optionnel)'}
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    maxLength={500}
                    placeholder={isRtl ? 'أي تفاصيل إضافية تريد تضيفها...' : 'Toute information supplémentaire...'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/500</p>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleSubmit} loading={submitting}>
              {isRtl ? '📨 أرسل الطلب' : '📨 Envoyer la demande'}
            </Button>

            <p className="text-center text-xs text-gray-400">
              {isRtl
                ? 'بعد مراجعة الطلب، فريقنا باش يتصل بيك ليعطيك بيانات الدخول'
                : "Après examen, notre équipe vous contactera pour vous fournir vos identifiants"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
