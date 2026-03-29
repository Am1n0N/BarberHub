'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { getTranslation, isRtl } from '@/i18n/config';
import { useAuth } from '@/hooks/useAuth';

function subscribeNoop() {
  return () => {};
}

interface LandingHeroProps {
  locale: string;
}

export default function LandingHero({ locale }: LandingHeroProps) {
  const { user } = useAuth();
  const t = getTranslation(locale);
  const rtl = isRtl(locale);

  const hasMounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  if (!hasMounted) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = user?.role?.toUpperCase();

  // ── OWNER ──────────────────────────────────────────────────────────────────
  if (role === 'OWNER') {
    return (
      <>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-2xl">🏪</span>
                <span className="text-white/90 text-sm font-medium">BarberHub</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                {t('landing.ownerWelcomeTitle')} {user?.name} 👋
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('landing.ownerWelcomeSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/${locale}/dashboard`}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  📊 {t('landing.ownerCtaDashboard')}
                </Link>
                <Link
                  href={`/${locale}/dashboard/queue`}
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 text-lg"
                >
                  👥 {t('landing.ownerCtaQueue')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href={`/${locale}/dashboard/queue`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-200 transition-colors">
                  <span className="text-3xl">👥</span>
                </div>
                <p className="font-semibold text-gray-800">{t('landing.ownerQuickQueue')}</p>
              </Link>
              <Link
                href={`/${locale}/dashboard/barbers`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-purple-200 transition-colors">
                  <span className="text-3xl">✂️</span>
                </div>
                <p className="font-semibold text-gray-800">{t('landing.ownerQuickBarbers')}</p>
              </Link>
              <Link
                href={`/${locale}/dashboard/services`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-orange-200 transition-colors">
                  <span className="text-3xl">🛠️</span>
                </div>
                <p className="font-semibold text-gray-800">{t('landing.ownerQuickServices')}</p>
              </Link>
              <Link
                href={`/${locale}/dashboard/payouts`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-green-200 transition-colors">
                  <span className="text-3xl">💰</span>
                </div>
                <p className="font-semibold text-gray-800">{t('landing.ownerQuickPayouts')}</p>
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ── BARBER ─────────────────────────────────────────────────────────────────
  if (role === 'BARBER') {
    return (
      <>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-2xl">✂️</span>
                <span className="text-white/90 text-sm font-medium">BarberHub</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                {t('landing.barberWelcomeTitle')} {user?.name} 👋
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('landing.barberWelcomeSubtitle')}
              </p>
              <Link
                href={`/${locale}/dashboard`}
                className="inline-block px-8 py-4 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                📊 {t('landing.barberCtaDashboard')}
              </Link>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Link
                href={`/${locale}/dashboard/queue`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-200 transition-colors">
                  <span className="text-3xl">👥</span>
                </div>
                <p className="font-semibold text-gray-800">{t('landing.barberQuickQueue')}</p>
              </Link>
              <Link
                href={`/${locale}/dashboard/bookings`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-indigo-200 transition-colors">
                  <span className="text-3xl">📅</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {rtl ? 'الرندي-فو' : 'Rendez-vous'}
                </p>
              </Link>
              <Link
                href={`/${locale}/dashboard/payouts`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-green-200 transition-colors">
                  <span className="text-3xl">💰</span>
                </div>
                <p className="font-semibold text-gray-800">{t('landing.barberQuickPayouts')}</p>
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ── CLIENT ─────────────────────────────────────────────────────────────────
  if (role === 'CLIENT') {
    return (
      <>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-2xl">💈</span>
                <span className="text-white/90 text-sm font-medium">BarberHub</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                {t('landing.clientWelcomeTitle')} {user?.name} 👋
              </h1>
              <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('landing.clientWelcomeSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/${locale}/map`}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  🗺️ {t('landing.clientCtaMap')}
                </Link>
                <Link
                  href={`/${locale}/my-bookings`}
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 text-lg"
                >
                  📅 {t('landing.clientCtaBook')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Client-focused features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-3xl">🗺️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('landing.clientFeature1Title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">{t('landing.clientFeature1Desc')}</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('landing.clientFeature2Title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">{t('landing.clientFeature2Desc')}</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('landing.clientFeature3Title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">{t('landing.clientFeature3Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Map CTA */}
        <section className="py-20 bg-teal-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {rtl ? 'لقى الحانوت القريب منّك' : 'Trouvez le salon le plus proche'}
            </h2>
            <p className="text-teal-100 max-w-xl mx-auto mb-8 text-lg">
              {rtl
                ? 'شوف كل الحوانيت في خريطة، كليك لتحجز مباشرة'
                : 'Visualisez tous les salons sur une carte, cliquez pour réserver'}
            </p>
            <Link
              href={`/${locale}/map`}
              className="inline-block px-10 py-4 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              {rtl ? '🗺️ شوف الخريطة' : '🗺️ Voir la carte'}
            </Link>
          </div>
        </section>
      </>
    );
  }

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  if (role === 'ADMIN') {
    return (
      <>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-rose-800" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-2xl">⚙️</span>
                <span className="text-white/90 text-sm font-medium">BarberHub Admin</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                {t('landing.adminWelcomeTitle')} 👋
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('landing.adminWelcomeSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/${locale}/admin`}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-red-700 font-bold rounded-xl hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  ⚙️ {t('landing.adminCtaPanel')}
                </Link>
                <Link
                  href={`/${locale}/admin/requests`}
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 text-lg"
                >
                  📨 {t('landing.adminCtaRequests')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Admin quick links */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Link
                href={`/${locale}/admin`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-red-200 transition-colors">
                  <span className="text-3xl">📊</span>
                </div>
                <p className="font-semibold text-gray-800">{t('landing.adminCtaPanel')}</p>
              </Link>
              <Link
                href={`/${locale}/admin/shops`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-200 transition-colors">
                  <span className="text-3xl">🏪</span>
                </div>
                <p className="font-semibold text-gray-800">{t('landing.adminCtaShops')}</p>
              </Link>
              <Link
                href={`/${locale}/admin/requests`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group"
              >
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-yellow-200 transition-colors">
                  <span className="text-3xl">📨</span>
                </div>
                <p className="font-semibold text-gray-800">{t('landing.adminCtaRequests')}</p>
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ── UNAUTHENTICATED (default) ───────────────────────────────────────────────
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">💈</span>
              <span className="text-white/90 text-sm font-medium">BarberHub</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('landing.heroTitle')}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/join`}
                className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                {t('landing.ctaOwner')}
              </Link>
              <Link
                href={`/${locale}/map`}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 text-lg"
              >
                {t('landing.ctaClient')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
                <span className="text-3xl">📺</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('landing.feature1Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.feature1Desc')}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('landing.feature2Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.feature2Desc')}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-5">
                <span className="text-3xl">🧮</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('landing.feature3Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            {rtl ? 'كيفاش تخدم?' : 'Comment ça marche?'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {rtl ? 'سجّل حانوتك' : 'Inscrivez votre salon'}
              </h3>
              <p className="text-gray-500">
                {rtl ? 'في دقيقتين تولّي جاهز' : 'Prêt en 2 minutes'}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {rtl ? 'حط التلفزة في الحانوت' : 'Affichez sur TV'}
              </h3>
              <p className="text-gray-500">
                {rtl ? 'الكليونات يشوفوا النوبة' : 'Les clients voient la file'}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {rtl ? 'اقبض و تصرّف' : 'Gérez et encaissez'}
              </h3>
              <p className="text-gray-500">
                {rtl ? 'الحساب أوتوماتيك كل يوم' : 'Calculs automatiques chaque jour'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Find a Shop Map CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <span className="text-xl">🗺️</span>
            <span className="text-white/90 text-sm font-medium">
              {rtl ? 'خريطة الحوانيت' : 'Carte des salons'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {rtl ? 'لقى الحانوت القريب منّك' : 'Trouvez le salon le plus proche'}
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto mb-8 text-lg">
            {rtl
              ? 'شوف كل الحوانيت في خريطة، وقّف فوق علامة باش تشوف التفاصيل، كليك لتحجز مباشرة'
              : 'Visualisez tous les salons sur une carte, survolez pour les détails, cliquez pour réserver'}
          </p>
          <Link
            href={`/${locale}/map`}
            className="inline-block px-10 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            {rtl ? '🗺️ شوف الخريطة' : '🗺️ Voir la carte'}
          </Link>
        </div>
      </section>

      {/* Join BarberHub CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <span className="text-xl">🚀</span>
            <span className="text-white/90 text-sm font-medium">
              {rtl ? 'انضم معنا' : 'Rejoignez-nous'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {rtl
              ? 'عندك حانوت؟ انضم لـ BarberHub'
              : 'Vous avez un salon\u00a0? Rejoignez BarberHub'}
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-8 text-lg">
            {rtl
              ? 'سجّل حانوتك وابدأ تستقبل حجوزات وتنظّم الصف من اليوم. مجاني وسريع!'
              : "Inscrivez votre salon et commencez à recevoir des réservations dès aujourd'hui. Gratuit et rapide\u00a0!"}
          </p>
          <Link
            href={`/${locale}/join`}
            className="inline-block px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            {rtl ? '📨 سجّل حانوتك تو' : '📨 Inscrire mon salon'}
          </Link>
        </div>
      </section>
    </>
  );
}
