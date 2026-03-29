'use client';

import { Service } from '@/lib/types';
import { formatPrice, formatDuration } from '@/lib/utils';

interface ServicePickerProps {
  services: Service[];
  locale?: string;
  selected: string;
  onSelect: (id: string) => void;
}

export default function ServicePicker({ services, locale = 'derja', selected, onSelect }: ServicePickerProps) {
  const isRtl = locale === 'derja';

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isRtl ? 'اختار الخدمة' : 'Choisir le service'}
      </h3>
      <div className="space-y-3">
        {services
          .filter((s) => s.isActive)
          .map((service) => (
            <button
              key={service._id}
              onClick={() => onSelect(service._id)}
              className={`w-full text-start p-4 rounded-xl border-2 transition-all ${
                selected === service._id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {isRtl ? service.name : service.nameFr}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDuration(service.duration, locale)}
                  </p>
                </div>
                <span className="text-lg font-bold text-blue-600">{formatPrice(service.price)}</span>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
