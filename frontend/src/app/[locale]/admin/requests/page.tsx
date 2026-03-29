'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { ShopRequest } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

type FilterStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'all';

export default function AdminRequestsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRtl = locale === 'derja';

  const [requests, setRequests] = useState<ShopRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterStatus>('PENDING');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Approve/reject modal
  const [selected, setSelected] = useState<ShopRequest | null>(null);
  const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewNote, setReviewNote] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationResult, setNotificationResult] = useState<{ emailSent: boolean; whatsappUrl: string | null } | null>(null);

  const loadRequests = (f: FilterStatus = filter, p = 1) => {
    setLoading(true);
    const statusParam = f === 'all' ? undefined : f;
    api.adminListRequests(statusParam, p)
      .then((r) => { setRequests(r.requests); setTotal(r.total); setPage(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(filter, 1); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openReview = (req: ShopRequest, act: 'APPROVED' | 'REJECTED') => {
    setSelected(req);
    setAction(act);
    setReviewNote('');
    setOwnerPassword('');
    setError(null);
  };

  const handleReview = async () => {
    if (!selected) return;
    setError(null);
    setNotificationResult(null);
    if (action === 'APPROVED' && ownerPassword.length > 0 && ownerPassword.length < 6) {
      setError(isRtl ? 'كلمة السر لازم تكون 6 خانات على الأقل' : 'Le mot de passe doit avoir au moins 6 caractères');
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.adminReviewRequest(selected.id, action, {
        reviewNote: reviewNote || undefined,
        ownerPassword: action === 'APPROVED' ? (ownerPassword || undefined) : undefined,
      });
      if (result.notification) {
        setNotificationResult(result.notification);
      } else {
        setSelected(null);
      }
      loadRequests(filter, page);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : (isRtl ? 'صار مشكل' : 'Une erreur est survenue'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  const statusLabel = (s: ShopRequest['status']) => {
    const map = isRtl
      ? { PENDING: 'في الانتظار', APPROVED: 'مقبول', REJECTED: 'مرفوض' }
      : { PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Rejeté' };
    return map[s];
  };

  const statusColor = (s: ShopRequest['status']) => {
    return s === 'APPROVED' ? 'bg-green-100 text-green-700'
      : s === 'REJECTED' ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';
  };

  const filters: { key: FilterStatus; label: string }[] = isRtl
    ? [
        { key: 'PENDING', label: 'في الانتظار' },
        { key: 'APPROVED', label: 'مقبولة' },
        { key: 'REJECTED', label: 'مرفوضة' },
        { key: 'all', label: 'الكل' },
      ]
    : [
        { key: 'PENDING', label: 'En attente' },
        { key: 'APPROVED', label: 'Approuvées' },
        { key: 'REJECTED', label: 'Rejetées' },
        { key: 'all', label: 'Toutes' },
      ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isRtl ? '📋 طلبات الانضمام' : '📋 Demandes d\'adhésion'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {total} {isRtl ? 'طلب' : 'demande(s)'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loading size="lg" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-500">{isRtl ? 'ما فمّا طلبات' : 'Aucune demande'}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{req.shopName}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(req.status)}`}>
                        {statusLabel(req.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">👤 {req.ownerName} · 📞 {req.ownerPhone}</p>
                    {req.ownerEmail && <p className="text-sm text-gray-500">📧 {req.ownerEmail}</p>}
                    <p className="text-sm text-gray-500">📍 {req.address}, {req.city}</p>
                    {req.message && (
                      <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{req.message}&rdquo;</p>
                    )}
                    {req.reviewNote && (
                      <p className="text-xs text-gray-400 mt-1">
                        {isRtl ? 'ملاحظة:' : 'Note :'} {req.reviewNote}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(req.createdAt).toLocaleDateString(isRtl ? 'ar-TN' : 'fr-TN')}
                    </p>
                  </div>
                  {req.status === 'PENDING' && (
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="primary" onClick={() => openReview(req, 'APPROVED')}>
                        {isRtl ? '✅ قبول' : '✅ Approuver'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openReview(req, 'REJECTED')}>
                        {isRtl ? '❌ رفض' : '❌ Rejeter'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => loadRequests(filter, page - 1)}>←</Button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => loadRequests(filter, page + 1)}>→</Button>
            </div>
          )}
        </>
      )}

      {/* Review modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setNotificationResult(null); }}
        title={
          notificationResult
            ? (isRtl ? '📨 تم الإرسال' : '📨 Notification envoyée')
            : action === 'APPROVED'
              ? (isRtl ? '✅ قبول الطلب' : '✅ Approuver la demande')
              : (isRtl ? '❌ رفض الطلب' : '❌ Rejeter la demande')
        }
      >
        {selected && notificationResult && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-5xl mb-4">🎉</p>
              <p className="text-lg font-bold text-gray-900 mb-2">
                {isRtl ? 'الطلب تقبّل بنجاح!' : 'Demande approuvée avec succès\u00a0!'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              <p className="font-semibold text-gray-900">{selected.shopName}</p>
              <div className="flex items-center gap-2">
                <span>{notificationResult.emailSent ? '✅' : '⚠️'}</span>
                <span className="text-gray-600">
                  {notificationResult.emailSent
                    ? (isRtl ? 'الإيمايل تبعث بنجاح' : 'Email envoyé avec succès')
                    : (isRtl ? 'ما تبعثش الإيمايل (ما فمّاش إيمايل أو SMTP غير مضبوط)' : 'Email non envoyé (pas d\'email ou SMTP non configuré)')}
                </span>
              </div>
              {notificationResult.whatsappUrl && (
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span className="text-gray-600">
                    {isRtl ? 'واتساب جاهز — كليك على الزر اللي تحت' : 'WhatsApp prêt — cliquez ci-dessous'}
                  </span>
                </div>
              )}
            </div>

            {notificationResult.whatsappUrl && (
              <a
                href={notificationResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
              >
                💬 {isRtl ? 'ابعث على الواتساب' : 'Envoyer via WhatsApp'}
              </a>
            )}

            <Button variant="ghost" className="w-full" onClick={() => { setSelected(null); setNotificationResult(null); }}>
              {isRtl ? 'سكّر' : 'Fermer'}
            </Button>
          </div>
        )}
        {selected && !notificationResult && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="font-semibold text-gray-900">{selected.shopName}</p>
              <p className="text-gray-600">{selected.ownerName} · {selected.ownerPhone}</p>
              {selected.ownerEmail && <p className="text-gray-500">📧 {selected.ownerEmail}</p>}
              <p className="text-gray-500">{selected.address}, {selected.city}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
            )}

            {action === 'APPROVED' && (
              <Input
                label={isRtl ? 'كلمة السر للصاحب (اختياري — تُولَّد تلقائيًا إن تُرِكت فارغة)' : 'Mot de passe propriétaire (optionnel — généré si vide)'}
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder={isRtl ? 'اتركها فارغة للتوليد التلقائي' : 'Laisser vide pour générer automatiquement'}
              />
            )}

            <Input
              label={isRtl ? 'ملاحظة للمراجعة (اختياري)' : 'Note de révision (optionnel)'}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={isRtl ? 'مثلاً: موقع غير مدعوم حاليًا' : 'Ex : Ville non couverte pour le moment'}
            />

            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant={action === 'APPROVED' ? 'primary' : 'danger'}
                onClick={handleReview}
                loading={submitting}
              >
                {action === 'APPROVED' ? (isRtl ? '✅ أكّد القبول' : '✅ Confirmer l\'approbation') : (isRtl ? '❌ أكّد الرفض' : '❌ Confirmer le rejet')}
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setSelected(null)}>
                {isRtl ? 'رجع' : 'Annuler'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
