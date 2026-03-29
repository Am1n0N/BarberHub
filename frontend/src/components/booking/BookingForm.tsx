'use client';

import { useState } from 'react';
import { Service, Barber } from '@/lib/types';
import Button from '@/components/ui/Button';
import ServicePicker from './ServicePicker';
import BarberPicker from './BarberPicker';
import TimeSlotPicker from './TimeSlotPicker';

interface BookingFormProps {
  locale?: string;
  services: Service[];
  barbers: Barber[];
  onSubmit: (data: {
    serviceId: string;
    barberId: string;
    date: string;
    timeSlot: string;
    clientName: string;
    clientPhone: string;
  }) => void;
  loading?: boolean;
}

export default function BookingForm({
  locale = 'derja',
  services,
  barbers,
  onSubmit,
  loading = false,
}: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const isRtl = locale === 'derja';

  const steps = isRtl
    ? ['الخدمة', 'الحجّام', 'الوقت', 'تأكيد']
    : ['Service', 'Barbier', 'Date & Heure', 'Confirmation'];

  const handleSubmit = () => {
    onSubmit({
      serviceId: selectedService,
      barberId: selectedBarber,
      date: selectedDate,
      timeSlot: selectedTime,
      clientName,
      clientPhone,
    });
  };

  const selectedServiceObj = services.find((s) => s._id === selectedService);
  const selectedBarberObj = barbers.find((b) => b._id === selectedBarber);

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs mt-1 text-gray-500">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 ${i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Service */}
      {step === 1 && (
        <ServicePicker
          services={services}
          locale={locale}
          selected={selectedService}
          onSelect={(id) => {
            setSelectedService(id);
            setStep(2);
          }}
        />
      )}

      {/* Step 2: Barber */}
      {step === 2 && (
        <BarberPicker
          barbers={barbers}
          locale={locale}
          selected={selectedBarber}
          onSelect={(id) => {
            setSelectedBarber(id);
            setStep(3);
          }}
        />
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <TimeSlotPicker
          locale={locale}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={setSelectedDate}
          onTimeChange={(time) => {
            setSelectedTime(time);
            setStep(4);
          }}
        />
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">
            {isRtl ? 'أكّد الرندي-فو' : 'Confirmer le rendez-vous'}
          </h3>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">{isRtl ? 'الخدمة' : 'Service'}</span>
              <span className="font-medium">
                {selectedServiceObj ? (isRtl ? selectedServiceObj.name : selectedServiceObj.nameFr) : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isRtl ? 'الحجّام' : 'Barbier'}</span>
              <span className="font-medium">{selectedBarberObj?.name || ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isRtl ? 'النهار' : 'Date'}</span>
              <span className="font-medium">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isRtl ? 'الوقت' : 'Heure'}</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            {selectedServiceObj && (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-500">{isRtl ? 'السوم' : 'Prix'}</span>
                <span className="font-bold text-blue-600">{selectedServiceObj.price} DT</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder={isRtl ? 'اسمك' : 'Votre nom'}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder={isRtl ? 'نمرة التليفون' : 'Numéro de téléphone'}
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            loading={loading}
            disabled={!clientName || !clientPhone}
          >
            {isRtl ? '✅ أكّد الرندي-فو' : '✅ Confirmer le rendez-vous'}
          </Button>
        </div>
      )}

      {/* Navigation */}
      {step > 1 && (
        <div className="mt-6">
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            {isRtl ? '← ارجع' : '← Retour'}
          </Button>
        </div>
      )}
    </div>
  );
}
