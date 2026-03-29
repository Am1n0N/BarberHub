import { isRtl } from '@/i18n/config';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const rtl = isRtl(locale);

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} lang={rtl ? 'ar' : 'fr'} className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
