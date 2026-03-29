'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface TimeSlotPickerProps {
  locale?: string;
  shopId: string;
  barberId: string;
  serviceId: string;
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

interface SlotInfo {
  time: string;
  available: boolean;
}

export default function TimeSlotPicker({
  locale = 'derja',
  shopId,
  barberId,
  serviceId,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: TimeSlotPickerProps) {
  const isRtl = locale === 'derja';
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString(isRtl ? 'ar-TN' : 'fr-TN', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  const fetchSlots = useCallback(async (date: string) => {
    if (!shopId || !barberId || !serviceId || !date) return;
    setLoading(true);
    try {
      const result = await api.getAvailableSlots({ shopId, barberId, serviceId, date });
      setSlots(result.slots);
      setDuration(result.duration);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, barberId, serviceId]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, fetchSlots]);

  const handleDateChange = (date: string) => {
    onDateChange(date);
  };

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
              onClick={() => handleDateChange(d.value)}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isRtl ? 'اختار الوقت' : "Choisir l'heure"}
          </h3>
          {duration > 0 && (
            <p className="text-sm text-gray-500 mb-3">
              {isRtl ? `كل وقت يدوم ${duration} دقيقة` : `Chaque créneau dure ${duration} min`}
            </p>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm text-gray-500">
                {isRtl ? 'يجيب الأوقات...' : 'Chargement des créneaux...'}
              </span>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-3xl mb-2">📅</p>
              <p>{isRtl ? 'ما فمّا أوقات متاحة هذا النهار' : 'Aucun créneau disponible ce jour'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => slot.available && onTimeChange(slot.time)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    !slot.available
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                      : selectedTime === slot.time
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
