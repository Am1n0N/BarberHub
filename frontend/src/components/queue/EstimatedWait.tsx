interface EstimatedWaitProps {
  minutes: number;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function EstimatedWait({ minutes, locale = 'derja', size = 'md' }: EstimatedWaitProps) {
  const isRtl = locale === 'derja';
  const label = isRtl ? 'وقت الإنتظار' : "Temps d'attente";
  const unit = isRtl ? 'دقيقة' : 'min';

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  };

  return (
    <div className="text-center">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className={`font-bold text-blue-600 ${sizes[size]}`}>
        ~{minutes} {unit}
      </p>
    </div>
  );
}
