'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'overview', icon: '📊', path: '' },
  { key: 'shops', icon: '💈', path: '/shops' },
  { key: 'requests', icon: '📋', path: '/requests' },
];

const labelsFr: Record<string, string> = {
  overview: "Vue d'ensemble",
  shops: 'Salons',
  requests: 'Demandes',
};

const labelsDerja: Record<string, string> = {
  overview: 'نظرة عامة',
  shops: 'الحوانيت',
  requests: 'الطلبات',
};

export default function AdminSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'derja';
  const labels = locale === 'derja' ? labelsDerja : labelsFr;
  const basePath = `/${locale}/admin`;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 hidden lg:block">
      <div className="flex items-center gap-2 px-3 mb-2">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <span className="text-lg font-bold text-gray-900">BarberHub</span>
      </div>
      <p className="text-xs text-red-600 font-semibold px-3 mb-6">
        {locale === 'derja' ? 'لوحة الإدارة' : 'Administration'}
      </p>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const href = `${basePath}${item.path}`;
          const isActive =
            item.path === ''
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname?.startsWith(href);

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-red-50 text-red-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{labels[item.key]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-gray-100">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <span>↩️</span>
          <span>{locale === 'derja' ? 'ارجع للداشبورد' : 'Retour au dashboard'}</span>
        </Link>
      </div>
    </aside>
  );
}
