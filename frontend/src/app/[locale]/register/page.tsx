'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { isRtl } from '@/i18n/config';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'derja';
  const rtl = isRtl(locale);
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'OWNER'>('CLIENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = rtl
    ? {
        title: 'افتح حساب جديد',
        subtitle: 'انضم لـ BarberHub',
        name: 'اسمك',
        phone: 'نمرة التليفون',
        phonePlaceholder: 'مثلاً: 99000000',
        password: 'كلمة السر',
        roleLabel: 'أنا',
        roleClient: 'كليون',
        roleOwner: 'صاحب حانوت',
        registerButton: 'افتح حساب جديد',
        haveAccount: 'عندك حساب؟',
        loginLink: 'ادخل',
        phoneExists: 'هاذي النمرة مستعملة',
        genericError: 'صار مشكل، عاود',
        ownerNote: 'باش تسجّل حانوتك، اكمّل على استمارة الانضمام',
        joinLink: 'استمارة الانضمام',
        loading: 'يستنى...',
      }
    : {
        title: 'Créer un compte',
        subtitle: 'Rejoignez BarberHub',
        name: 'Votre nom',
        phone: 'Numéro de téléphone',
        phonePlaceholder: 'Ex: 99000000',
        password: 'Mot de passe',
        roleLabel: 'Je suis',
        roleClient: 'Client',
        roleOwner: 'Propriétaire de salon',
        registerButton: 'Créer un compte',
        haveAccount: 'Déjà un compte?',
        loginLink: 'Se connecter',
        phoneExists: 'Ce numéro est déjà utilisé',
        genericError: 'Une erreur est survenue, réessayez',
        ownerNote: "Pour inscrire votre salon, complétez le formulaire d'inscription",
        joinLink: "Formulaire d'inscription",
        loading: 'Chargement...',
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, phone, password, role });
      if (role === 'OWNER') {
        router.push(`/${locale}/join`);
      } else {
        router.push(`/${locale}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('409') || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
        setError(t.phoneExists);
      } else {
        setError(t.genericError);
      }
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
            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.roleLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    role === 'CLIENT'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="block text-xl mb-1">💈</span>
                  {t.roleClient}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    role === 'OWNER'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="block text-xl mb-1">🏪</span>
                  {t.roleOwner}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

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
                minLength={6}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {role === 'OWNER' && (
              <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 rounded-xl">
                {t.ownerNote}{' '}
                <Link
                  href={`/${locale}/join`}
                  className="font-semibold underline"
                >
                  {t.joinLink}
                </Link>
              </div>
            )}

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
              {loading ? t.loading : t.registerButton}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t.haveAccount}{' '}
            <Link
              href={`/${locale}/login`}
              className="text-blue-600 font-medium hover:underline"
            >
              {t.loginLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
