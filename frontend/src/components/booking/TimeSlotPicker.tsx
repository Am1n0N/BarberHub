'use client';

import { generateTimeSlots } from '@/lib/utils';

interface TimeSlotPickerProps {
  locale?: string;
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export default function TimeSlotPicker({
  locale = 'derja',
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: TimeSlotPickerProps) {
  const isRtl = locale === 'derja';
  const slots = generateTimeSlots('09:00', '20:00', 30);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString(isRtl ? 'ar-TN' : 'fr-TN', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {isRtl ? 'اختار النهار' : 'Choisir la date'}
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {dates.map((d) => (
            <button
              key={d.value}
              onClick={() => onDateChange(d.value)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedDate === d.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {isRtl ? 'اختار الوقت' : "Choisir l'heure"}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => onTimeChange(slot)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedTime === slot
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
