'use client';

import { Barber } from '@/lib/types';

interface BarberPickerProps {
  barbers: Barber[];
  locale?: string;
  selected: string;
  onSelect: (id: string) => void;
}

export default function BarberPicker({ barbers, locale = 'derja', selected, onSelect }: BarberPickerProps) {
  const isRtl = locale === 'derja';
  const availableBarbers = barbers.filter((b) => b.isAvailable);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isRtl ? 'اختار الحجّام' : 'Choisir le barbier'}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {availableBarbers.map((barber) => (
          <button
            key={barber._id}
            onClick={() => onSelect(barber._id)}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              selected === barber._id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-100 hover:border-gray-200 bg-white'
            }`}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {barber.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="font-semibold text-gray-900">{barber.name}</p>
            <p className="text-xs text-green-600 mt-1">
              {isRtl ? 'متوفّر' : 'Disponible'}
            </p>
          </button>
        ))}

        {availableBarbers.length === 0 && (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500">
              {isRtl ? 'ما فمّا حتى حجّام متوفّر' : 'Aucun barbier disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
