'use client';

import { QueueEntry } from '@/lib/types';
import QueueCard from './QueueCard';

interface QueueDisplayProps {
  entries: QueueEntry[];
  locale?: string;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function QueueDisplay({
  entries,
  locale = 'derja',
  onStart,
  onComplete,
  onCancel,
  onMoveUp,
  onMoveDown,
  showActions = false,
  compact = false,
}: QueueDisplayProps) {
  const isRtl = locale === 'derja';
  const noOneText = isRtl ? 'ما فمّا حد في الصف' : "Personne dans la file";

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">💈</p>
        <p className="text-gray-500 text-lg">{noOneText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <QueueCard
          key={entry._id}
          entry={entry}
          locale={locale}
          position={index + 1}
          onStart={onStart}
          onComplete={onComplete}
          onCancel={onCancel}
          onMoveUp={index > 0 ? onMoveUp : undefined}
          onMoveDown={index < entries.length - 1 ? onMoveDown : undefined}
          showActions={showActions}
          compact={compact}
        />
      ))}
    </div>
  );
}
