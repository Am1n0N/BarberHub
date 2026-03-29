'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const ownerNavItems = [
  { key: 'home', icon: '📊', path: '' },
  { key: 'queue', icon: '👥', path: '/queue' },
  { key: 'bookings', icon: '📅', path: '/bookings' },
  { key: 'barbers', icon: '✂️', path: '/barbers' },
  { key: 'payouts', icon: '💰', path: '/payouts' },
  { key: 'services', icon: '🛠', path: '/services' },
  { key: 'settings', icon: '⚙️', path: '/settings' },
];

const barberNavItems = [
  { key: 'home', icon: '📊', path: '' },
  { key: 'queue', icon: '👥', path: '/queue' },
  { key: 'bookings', icon: '📅', path: '/bookings' },
  { key: 'payouts', icon: '💰', path: '/payouts' },
  { key: 'profile', icon: '👤', path: '/profile' },
];

const labelsFr: Record<string, string> = {
  home: 'Tableau de bord',
  queue: "File d'attente",
  bookings: 'Rendez-vous',
  barbers: 'Barbiers',
  payouts: 'Paiements',
  services: 'Services',
  settings: 'Paramètres',
  profile: 'Mon profil',
};

const labelsDerja: Record<string, string> = {
  home: 'لوحة التحكّم',
  queue: 'النوبة',
  bookings: 'رندي-فو',
  barbers: 'الحجّاما',
  payouts: 'الحسابات',
  services: 'الخدمات',
  settings: 'إعدادات',
  profile: 'حسابي',
};

export default function Sidebar() {
  const params = useParams();
  const pathname = usePathname();
  const { user } = useAuth();
  const locale = (params?.locale as string) || 'derja';
  const labels = locale === 'derja' ? labelsDerja : labelsFr;
  const basePath = `/${locale}/dashboard`;

  const isBarber = user?.role?.toUpperCase() === 'BARBER';
  const navItems = isBarber ? barberNavItems : ownerNavItems;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 hidden lg:block">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">BH</span>
        </div>
        <span className="text-lg font-bold text-gray-900">BarberHub</span>
      </div>

      {/* Role badge */}
      {isBarber && (
        <div className="mx-3 mb-4 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg">
          <p className="text-xs font-medium text-purple-700">
            ✂️ {locale === 'derja' ? 'حجّام' : 'Barbier'}
          </p>
        </div>
      )}

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
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{labels[item.key]}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
