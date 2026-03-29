'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/lib/types';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// A noop subscribe that never fires — used to distinguish server from client render
function subscribeNoop() {
  return () => {};
}

function hasAllowedRole(user: User | null, allowedRoles?: string[]): boolean {
  if (!allowedRoles) return true;
  if (!user) return false;
  return allowedRoles.some((r) => r.toUpperCase() === user.role?.toUpperCase());
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'derja';
  const redirectedRef = useRef(false);

  // `hasMounted` is false during SSR/hydration and true once on the client
  const hasMounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!hasMounted || redirectedRef.current) return;
    if (!isAuthenticated) {
      redirectedRef.current = true;
      router.push(`/${locale}/login`);
      return;
    }
    if (!hasAllowedRole(user, allowedRoles)) {
      redirectedRef.current = true;
      router.push(`/${locale}`);
    }
  }, [hasMounted, isAuthenticated, user, router, locale, allowedRoles]);

  // Show neutral loading state during SSR/hydration
  if (!hasMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!hasAllowedRole(user, allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
