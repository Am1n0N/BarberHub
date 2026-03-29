'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import type { ShopMapItem } from '@/lib/types';
import Loading from '@/components/ui/Loading';

// Load the map only on the client (Leaflet is not SSR-compatible)
const ShopMap = dynamic(() => import('@/components/map/ShopMap'), { ssr: false });

type GenderFilter = '' | 'MEN' | 'WOMEN' | 'UNISEX';

export default function MapPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRtl = locale === 'derja';

  const [shops, setShops] = useState<ShopMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('');

  useEffect(() => {
    setLoading(true);
    api
      .listShops(genderFilter || undefined)
      .then(setShops)
      .catch(() =>
        setError(isRtl ? 'ما قدرناش يجيبوا الحوانيت' : 'Impossible de charger les salons')
      )
      .finally(() => setLoading(false));
  }, [isRtl, genderFilter]);

  const shopsOnMap = shops.filter((s) => s.latitude !== null && s.longitude !== null);

  const filterOptions: { value: GenderFilter; label: string; icon: string }[] = [
    { value: '', label: isRtl ? 'الكل' : 'Tous', icon: '🏪' },
    { value: 'MEN', label: isRtl ? 'رجال' : 'Hommes', icon: '💈' },
    { value: 'WOMEN', label: isRtl ? 'نساء' : 'Femmes', icon: '💅' },
    { value: 'UNISEX', label: isRtl ? 'مختلط' : 'Mixte', icon: '✨' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-5 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            {isRtl ? '🗺️ لقى حانوت قريب منّك' : '🗺️ Trouvez un salon près de vous'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isRtl
              ? `${shopsOnMap.length} حانوت موجود في الخريطة — وقّف فوق علامة باش تشوف التفاصيل`
              : `${shopsOnMap.length} salon${shopsOnMap.length !== 1 ? 's' : ''} sur la carte — survolez un marqueur pour les détails`}
          </p>

          {/* Gender filter tabs */}
          <div className="flex gap-2 mt-4">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGenderFilter(opt.value)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  genderFilter === opt.value
                    ? opt.value === 'WOMEN'
                      ? 'bg-pink-600 text-white shadow-md'
                      : opt.value === 'UNISEX'
                        ? 'bg-purple-600 text-white shadow-md'
                        : opt.value === 'MEN'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-800 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative" style={{ minHeight: '70vh' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <Loading size="lg" text={isRtl ? 'يستنى...' : 'Chargement...'} />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <p className="text-5xl mb-3">🗺️</p>
              <p className="text-lg text-gray-600">{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && <ShopMap shops={shops} locale={locale} />}
      </div>

      {/* No-coords notice */}
      {!loading && !error && shopsOnMap.length === 0 && (
        <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-3 text-center text-sm text-yellow-800">
          {isRtl
            ? 'ما فمّا حانوت عنده موقع محدد بعد. اطلب من صاحب الحانوت يضيف الموقع.'
            : "Aucun salon n'a encore renseigné ses coordonnées. Demandez au propriétaire de les ajouter."}
        </div>
      )}
    </div>
  );
}
