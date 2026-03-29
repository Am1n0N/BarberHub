'use client';

import { useState, useEffect, useCallback } from 'react';
import { QueueEntry } from '@/lib/types';
import { api } from '@/lib/api';
import { getSocket, joinShopRoom, leaveShopRoom } from '@/lib/socket';

export function useQueue(shopId: string) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getQueue(shopId);
      setQueue(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchQueue();
    joinShopRoom(shopId);

    const socket = getSocket();

    socket.on('queue:update', (updatedQueue: QueueEntry[]) => {
      setQueue(updatedQueue);
    });

    socket.on('queue:entry:added', (entry: QueueEntry) => {
      setQueue((prev) => [...prev, entry]);
    });

    socket.on('queue:entry:updated', (entry: QueueEntry) => {
      setQueue((prev) => prev.map((e) => (e._id === entry._id ? entry : e)));
    });

    socket.on('queue:entry:removed', (entryId: string) => {
      setQueue((prev) => prev.filter((e) => e._id !== entryId));
    });

    return () => {
      leaveShopRoom(shopId);
      socket.off('queue:update');
      socket.off('queue:entry:added');
      socket.off('queue:entry:updated');
      socket.off('queue:entry:removed');
    };
  }, [shopId, fetchQueue]);

  const activeQueue = queue.filter((e) => e.status === 'WAITING' || e.status === 'IN_PROGRESS');
  const currentlyServing = queue.filter((e) => e.status === 'IN_PROGRESS');
  const waiting = queue.filter((e) => e.status === 'WAITING');

  return {
    queue,
    activeQueue,
    currentlyServing,
    waiting,
    loading,
    error,
    refetch: fetchQueue,
  };
}
