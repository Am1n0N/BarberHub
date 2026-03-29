import Link from 'next/link';
import { getTranslation } from '@/i18n/config';

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getTranslation(locale);
  const isRtl = locale === 'derja';

  return (
    <div className="min-h-screen">
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
                href={`/${locale}/dashboard`}
                className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                {t('landing.ctaOwner')}
              </Link>
              <Link
                href={`/${locale}/book/demo-shop`}
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
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
                <span className="text-3xl">📺</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('landing.feature1Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('landing.feature1Desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('landing.feature2Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('landing.feature2Desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-5">
                <span className="text-3xl">🧮</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('landing.feature3Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('landing.feature3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            {isRtl ? 'كيفاش تخدم?' : 'Comment ça marche?'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {isRtl ? 'سجّل حانوتك' : 'Inscrivez votre salon'}
              </h3>
              <p className="text-gray-500">
                {isRtl ? 'في دقيقتين تولّي جاهز' : 'Prêt en 2 minutes'}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {isRtl ? 'حط التلفزة في الحانوت' : 'Affichez sur TV'}
              </h3>
              <p className="text-gray-500">
                {isRtl ? 'الكليونات يشوفوا النوبة' : 'Les clients voient la file'}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {isRtl ? 'اقبض و تصرّف' : 'Gérez et encaissez'}
              </h3>
              <p className="text-gray-500">
                {isRtl ? 'الحساب أوتوماتيك كل يوم' : 'Calculs automatiques chaque jour'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
