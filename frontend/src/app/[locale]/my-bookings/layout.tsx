import AuthGuard from '@/components/layout/AuthGuard';

export default function MyBookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['CLIENT']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
