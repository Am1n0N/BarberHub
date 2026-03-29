'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';

export default function AdminOverviewPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRtl = locale === 'derja';

  const [shopsTotal, setShopsTotal] = useState<number | null>(null);
  const [pendingTotal, setPendingTotal] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.adminListShops(1).then((r) => setShopsTotal(r.total)).catch(() => {}),
      api.adminListRequests('PENDING', 1).then((r) => setPendingTotal(r.total)).catch(() => {}),
    ]);
  }, []);

  const stats = [
    {
      icon: '💈',
      label: isRtl ? 'إجمالي الحوانيت' : 'Total salons',
      value: shopsTotal ?? '…',
      href: `/${locale}/admin/shops`,
      cardClass: 'bg-blue-50',
    },
    {
      icon: '📋',
      label: isRtl ? 'طلبات بانتظار المراجعة' : 'Demandes en attente',
      value: pendingTotal ?? '…',
      href: `/${locale}/admin/requests`,
      cardClass: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isRtl ? '👋 مرحبا، أدمن' : '👋 Bienvenue, Admin'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isRtl ? 'تصرّف في الحوانيت والطلبات من هنا' : 'Gérez les salons et les demandes depuis ici'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {stats.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card hover className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${s.cardClass}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{String(s.value)}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href={`/${locale}/admin/shops`}
          className="bg-blue-600 text-white rounded-2xl p-6 hover:bg-blue-700 transition-colors"
        >
          <span className="text-3xl">💈</span>
          <h3 className="text-lg font-bold mt-2">
            {isRtl ? 'إضافة حانوت جديد' : 'Ajouter un salon'}
          </h3>
          <p className="text-blue-200 text-sm mt-1">
            {isRtl ? 'أنشئ حساب صاحب حانوت وأضف حانوته مباشرة' : 'Créez un compte propriétaire et son salon directement'}
          </p>
        </Link>
        <Link
          href={`/${locale}/admin/requests`}
          className="bg-orange-500 text-white rounded-2xl p-6 hover:bg-orange-600 transition-colors"
        >
          <span className="text-3xl">📋</span>
          <h3 className="text-lg font-bold mt-2">
            {isRtl ? 'مراجعة الطلبات' : 'Examiner les demandes'}
          </h3>
          <p className="text-orange-100 text-sm mt-1">
            {isRtl ? 'قبول أو رفض طلبات الانضمام' : 'Approuver ou rejeter les demandes d\'adhésion'}
          </p>
        </Link>
      </div>
    </div>
  );
}
