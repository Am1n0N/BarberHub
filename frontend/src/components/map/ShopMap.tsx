'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { ShopMapItem } from '@/lib/types';

interface ShopMapProps {
  shops: ShopMapItem[];
  locale: string;
}

// Default center: Tunisia
const DEFAULT_CENTER: [number, number] = [33.8869, 9.5375];
const DEFAULT_ZOOM = 6;

export default function ShopMap({ shops, locale }: ShopMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const router = useRouter();
  const isRtl = locale === 'derja';

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Prevent double-initialisation (React Strict Mode)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const shopsWithCoords = shops.filter(
        (s) => s.latitude !== null && s.longitude !== null
      );

      shopsWithCoords.forEach((shop) => {
        const marker = L.marker([shop.latitude as number, shop.longitude as number]);

        const bookLabel = isRtl ? 'احجز رندي-فو' : 'Prendre rendez-vous';
        const addressLabel = isRtl ? 'العنوان' : 'Adresse';
        const phoneLabel = isRtl ? 'التليفون' : 'Téléphone';

        const popupContent = `
          <div style="min-width:200px;font-family:system-ui,sans-serif;">
            <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1e40af;">
              💈 ${shop.name}
            </p>
            <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">
              📍 ${addressLabel}: ${shop.address}, ${shop.city}
            </p>
            <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">
              📞 ${phoneLabel}: ${shop.phone}
            </p>
            <button
              id="book-btn-${shop.id}"
              style="
                display:block;width:100%;padding:8px 12px;
                background:#2563eb;color:#fff;border:none;
                border-radius:8px;font-size:14px;font-weight:600;
                cursor:pointer;text-align:center;
              "
            >
              ${bookLabel} →
            </button>
          </div>
        `;

        const popup = L.popup({ maxWidth: 280 }).setContent(popupContent);
        marker.bindPopup(popup);

        // Show popup on hover
        marker.on('mouseover', () => marker.openPopup());

        // Navigate to booking page on button click (event delegation after popup opens)
        marker.on('popupopen', () => {
          const btn = document.getElementById(`book-btn-${shop.id}`);
          if (btn) {
            btn.onclick = () => router.push(`/${locale}/book/${shop.slug}`);
          }
        });

        marker.addTo(map);
      });
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [shops, locale, router]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
      aria-label={isRtl ? 'خريطة الحوانيت' : 'Carte des salons'}
    />
  );
}
