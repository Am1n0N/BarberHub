'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { isRtl } from '@/i18n/config';
import { useAuth } from '@/hooks/useAuth';

function getRoleLabel(role: string, rtl: boolean): string {
  const roleMap: Record<string, { rtl: string; ltr: string }> = {
    CLIENT: { rtl: 'كليون', ltr: 'Client' },
    OWNER: { rtl: 'صاحب حانوت', ltr: 'Propriétaire' },
    BARBER: { rtl: 'حجّام', ltr: 'Barbier' },
    ADMIN: { rtl: 'مدير', ltr: 'Administrateur' },
  };
  const entry = roleMap[role?.toUpperCase()];
  if (!entry) return role;
  return rtl ? entry.rtl : entry.ltr;
}

export default function Navbar() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'derja';
  const rtl = isRtl(locale);
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const userRole = user?.role?.toUpperCase();
  const canAccessDashboard =
    userRole === 'OWNER' || userRole === 'BARBER' || userRole === 'ADMIN';
  const isAdmin = userRole === 'ADMIN';
  const isClient = userRole === 'CLIENT';

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.push(`/${locale}`);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BH</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BarberHub</span>
          </Link>

          {/* Right-side controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Map link — always visible */}
            <Link
              href={`/${locale}/map`}
              className="hidden sm:flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <span>🗺️</span>
              <span>{rtl ? 'الخريطة' : 'Carte'}</span>
            </Link>

            {isAuthenticated && user ? (
              <>
                {/* Dashboard link (desktop) */}
                {canAccessDashboard && (
                  <Link
                    href={`/${locale}/dashboard`}
                    className="hidden sm:block text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                  >
                    {rtl ? 'لوحة التحكّم' : 'Dashboard'}
                  </Link>
                )}

                {/* Admin link (desktop) */}
                {isAdmin && (
                  <Link
                    href={`/${locale}/admin`}
                    className="hidden sm:block text-sm font-medium text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    {rtl ? 'الإدارة' : 'Admin'}
                  </Link>
                )}

                {/* My Bookings link (desktop, CLIENT only) */}
                {isClient && (
                  <Link
                    href={`/${locale}/my-bookings`}
                    className="hidden sm:block text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-teal-50"
                  >
                    {rtl ? 'رندي-فواتي' : 'Mes RDV'}
                  </Link>
                )}

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-semibold text-xs">
                        {user.name?.charAt(0).toUpperCase() ?? 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block max-w-[120px] truncate font-medium">
                      {user.name}
                    </span>
                    <span className="text-gray-400 text-xs">▾</span>
                  </button>

                  {menuOpen && (
                    <>
                      {/* Backdrop to close menu on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                      />
                      <div
                        className={`absolute top-full mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50 ${
                          rtl ? 'left-0' : 'right-0'
                        }`}
                      >
                        <div className="px-4 py-2.5 border-b border-gray-50">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {getRoleLabel(user.role, rtl)}
                          </p>
                        </div>

                        {canAccessDashboard && (
                          <Link
                            href={`/${locale}/dashboard`}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <span>📊</span>
                            {rtl ? 'لوحة التحكّم' : 'Dashboard'}
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            href={`/${locale}/admin`}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <span>⚙️</span>
                            {rtl ? 'الإدارة' : 'Admin'}
                          </Link>
                        )}

                        {isClient && (
                          <Link
                            href={`/${locale}/my-bookings`}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <span>📅</span>
                            {rtl ? 'رندي-فواتي' : 'Mes rendez-vous'}
                          </Link>
                        )}

                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <span>🚪</span>
                            {rtl ? 'اخرج' : 'Se déconnecter'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login button */}
                <Link
                  href={`/${locale}/login`}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  {rtl ? 'ادخل' : 'Connexion'}
                </Link>

                {/* Register button */}
                <Link
                  href={`/${locale}/register`}
                  className="hidden sm:block text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg"
                >
                  {rtl ? 'سجّل روحك' : 'Inscription'}
                </Link>
              </>
            )}

            {/* Language toggle */}
            <Link
              href={locale === 'derja' ? '/fr' : '/derja'}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-200 font-medium"
            >
              {locale === 'derja' ? 'FR' : 'تونسي'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
