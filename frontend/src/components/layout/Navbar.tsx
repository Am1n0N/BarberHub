'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { isRtl } from '@/i18n/config';

export default function Navbar() {
  const params = useParams();
  const locale = (params?.locale as string) || 'derja';
  const rtl = isRtl(locale);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-lg bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BH</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BarberHub</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/map`}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 hidden sm:block"
            >
              {rtl ? '🗺️ الخريطة' : '🗺️ Carte'}
            </Link>
            <Link
              href={`/${locale}/join`}
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg hidden sm:block"
            >
              {rtl ? 'انضم معنا' : 'Rejoindre'}
            </Link>
            <Link
              href={locale === 'derja' ? '/fr' : '/derja'}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              {locale === 'derja' ? 'Français' : 'تونسي'}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {rtl ? 'لوحة التحكّم' : 'Dashboard'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
