'use client';

import { Payout } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface PayoutTableProps {
  payouts: Payout[];
  locale?: string;
  onMarkPaid?: (id: string) => void;
}

export default function PayoutTable({ payouts, locale = 'fr', onMarkPaid }: PayoutTableProps) {
  const isRtl = locale === 'derja';

  const headers = isRtl
    ? ['الحجّام', 'خدمات', 'الدخل', 'حصة الحجّام', 'حصة صاحب الحانوت', 'الحالة']
    : ['Barbier', 'Services', 'Revenu', 'Part barbier', 'Part propriétaire', 'Statut'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((h, i) => (
              <th key={i} className="text-start py-3 px-4 text-sm font-medium text-gray-500">
                {h}
              </th>
            ))}
            {onMarkPaid && <th className="py-3 px-4" />}
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr key={payout._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-900">{payout.barberName}</td>
              <td className="py-3 px-4 text-gray-600">{payout.servicesCount}</td>
              <td className="py-3 px-4 font-semibold text-gray-900">{formatPrice(payout.totalRevenue)}</td>
              <td className="py-3 px-4 text-blue-600 font-medium">{formatPrice(payout.barberShare)}</td>
              <td className="py-3 px-4 text-green-600 font-medium">{formatPrice(payout.ownerShare)}</td>
              <td className="py-3 px-4">
                <Badge
                  status={payout.isPaid ? 'COMPLETED' : 'PENDING'}
                  label={payout.isPaid ? (isRtl ? 'تخلّص' : 'Payé') : (isRtl ? 'مازال' : 'Non payé')}
                />
              </td>
              {onMarkPaid && (
                <td className="py-3 px-4">
                  {!payout.isPaid && (
                    <Button size="sm" variant="outline" onClick={() => onMarkPaid(payout._id)}>
                      {isRtl ? 'خلّصتو' : 'Marquer payé'}
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {payouts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">{isRtl ? 'ما فمّا حسابات' : 'Aucun paiement'}</p>
        </div>
      )}
    </div>
  );
}
