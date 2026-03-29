'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { isRtl } from '@/i18n/config';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'derja';
  const rtl = isRtl(locale);
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = rtl
    ? {
        title: 'ادخل لحسابك',
        subtitle: 'مرحبا بيك في BarberHub',
        phone: 'نمرة التليفون',
        phonePlaceholder: 'مثلاً: 99000000',
        password: 'كلمة السر',
        loginButton: 'ادخل لحسابك',
        noAccount: 'ما عندكش حساب؟',
        registerLink: 'افتح حساب جديد',
        wrongCredentials: 'النمرة أو كلمة السر غالطة',
        loading: 'يستنى...',
      }
    : {
        title: 'Connexion',
        subtitle: 'Bienvenue sur BarberHub',
        phone: 'Numéro de téléphone',
        phonePlaceholder: 'Ex: 99000000',
        password: 'Mot de passe',
        loginButton: 'Se connecter',
        noAccount: 'Pas encore de compte?',
        registerLink: 'Créer un compte',
        wrongCredentials: 'Numéro ou mot de passe incorrect',
        loading: 'Chargement...',
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(phone, password);
      const role = user.role?.toUpperCase();
      if (role === 'ADMIN') {
        router.push(`/${locale}/admin`);
      } else if (role === 'OWNER' || role === 'BARBER') {
        router.push(`/${locale}/dashboard`);
      } else {
        router.push(`/${locale}`);
      }
    } catch {
      setError(t.wrongCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">BH</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">BarberHub</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.phone}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t.loading : t.loginButton}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t.noAccount}{' '}
            <Link
              href={`/${locale}/register`}
              className="text-blue-600 font-medium hover:underline"
            >
              {t.registerLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
