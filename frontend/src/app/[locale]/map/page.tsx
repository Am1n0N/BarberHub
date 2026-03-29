'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import type { ShopMapItem } from '@/lib/types';
import Loading from '@/components/ui/Loading';

// Load the map only on the client (Leaflet is not SSR-compatible)
const ShopMap = dynamic(() => import('@/components/map/ShopMap'), { ssr: false });

export default function MapPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRtl = locale === 'derja';

  const [shops, setShops] = useState<ShopMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listShops()
      .then(setShops)
      .catch(() =>
        setError(isRtl ? 'ما قدرناش يجيبوا الحوانيت' : 'Impossible de charger les salons')
      )
      .finally(() => setLoading(false));
  }, [isRtl]);

  const shopsOnMap = shops.filter((s) => s.latitude !== null && s.longitude !== null);

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
        {!loading && !error && (
          <>
            {/* Leaflet CSS */}
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
              rel="stylesheet"
              href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
              crossOrigin=""
            />
            <ShopMap shops={shops} locale={locale} />
          </>
        )}
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
