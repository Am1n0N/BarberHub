'use client';

import { QueueEntry } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface QueueCardProps {
  entry: QueueEntry;
  position: number;
  locale?: string;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function QueueCard({
  entry,
  position,
  locale = 'derja',
  onStart,
  onComplete,
  onCancel,
  onMoveUp,
  onMoveDown,
  showActions = false,
  compact = false,
}: QueueCardProps) {
  const isRtl = locale === 'derja';
  const isInProgress = entry.status === 'IN_PROGRESS';

  const statusLabels: Record<string, string> = isRtl
    ? { WAITING: 'يستنى', IN_PROGRESS: 'يتخدم', COMPLETED: 'كمل', CANCELLED: 'تلغى' }
    : { WAITING: 'En attente', IN_PROGRESS: 'En cours', COMPLETED: 'Terminé', CANCELLED: 'Annulé' };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-4 transition-all duration-300',
        isInProgress ? 'border-blue-300 bg-blue-50 shadow-md' : 'border-gray-100',
        compact && 'p-3'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
              isInProgress ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            {position}
          </div>
          <div>
            <p className={cn('font-semibold text-gray-900', compact && 'text-sm')}>
              {entry.clientName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {entry.barberName && (
                <span className="text-xs text-gray-500">✂️ {entry.barberName}</span>
              )}
              {entry.serviceName && (
                <span className="text-xs text-gray-500">• {entry.serviceName}</span>
              )}
              {entry.isWalkIn && (
                <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                  {isRtl ? 'بلا رندي-فو' : 'Walk-in'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge status={entry.status} label={statusLabels[entry.status] || entry.status} />

          {entry.status === 'WAITING' && entry.estimatedWait > 0 && (
            <span className="text-xs text-gray-500">
              ~{entry.estimatedWait} {isRtl ? 'د' : 'min'}
            </span>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {entry.status === 'WAITING' && (
            <>
              {onMoveUp && (
                <Button size="sm" variant="ghost" onClick={() => onMoveUp(entry._id)}>
                  ↑
                </Button>
              )}
              {onMoveDown && (
                <Button size="sm" variant="ghost" onClick={() => onMoveDown(entry._id)}>
                  ↓
                </Button>
              )}
              {onStart && (
                <Button size="sm" variant="primary" onClick={() => onStart(entry._id)}>
                  {isRtl ? 'ابدا' : 'Commencer'}
                </Button>
              )}
              {onCancel && (
                <Button size="sm" variant="danger" onClick={() => onCancel(entry._id)}>
                  {isRtl ? 'ألغي' : 'Annuler'}
                </Button>
              )}
            </>
          )}
          {entry.status === 'IN_PROGRESS' && onComplete && (
            <Button size="sm" variant="primary" onClick={() => onComplete(entry._id)}>
              {isRtl ? 'كمّل' : 'Terminer'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
