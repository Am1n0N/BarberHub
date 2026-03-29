import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  className?: string;
}

export default function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1 font-medium">{trend}</p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
