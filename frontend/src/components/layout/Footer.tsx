import Link from 'next/link';

export default function Footer({ locale = 'derja' }: { locale?: string }) {
  const isRtl = locale === 'derja';

  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">BH</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">BarberHub</span>
          </div>

          <p className="text-sm text-gray-500">
            {isRtl ? '© 2024 BarberHub. جميع الحقوق محفوظة' : '© 2024 BarberHub. Tous droits réservés'}
          </p>

          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isRtl ? 'الرئيسية' : 'Accueil'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
