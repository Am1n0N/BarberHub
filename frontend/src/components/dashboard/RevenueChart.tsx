import { formatPrice } from '@/lib/utils';

interface RevenueChartProps {
  totalRevenue: number;
  barberShare: number;
  ownerShare: number;
  locale?: string;
}

export default function RevenueChart({
  totalRevenue,
  barberShare,
  ownerShare,
  locale = 'fr',
}: RevenueChartProps) {
  const isRtl = locale === 'derja';
  const barberPercent = totalRevenue > 0 ? (barberShare / totalRevenue) * 100 : 0;
  const ownerPercent = totalRevenue > 0 ? (ownerShare / totalRevenue) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isRtl ? 'تقسيم الدخل' : 'Répartition des revenus'}
      </h3>

      <div className="text-center mb-6">
        <p className="text-4xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
        <p className="text-sm text-gray-500 mt-1">{isRtl ? 'الدخل الكل' : 'Revenu total'}</p>
      </div>

      {/* Simple bar chart */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-blue-600">
              {isRtl ? 'حصة الحجّاما' : 'Part barbiers'}
            </span>
            <span className="text-sm font-bold text-blue-600">{formatPrice(barberShare)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${barberPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-green-600">
              {isRtl ? 'حصة صاحب الحانوت' : 'Part propriétaire'}
            </span>
            <span className="text-sm font-bold text-green-600">{formatPrice(ownerShare)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${ownerPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
