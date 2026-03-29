import LandingHero from '@/components/landing/LandingHero';

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      <LandingHero locale={locale} />
    </div>
  );
}
