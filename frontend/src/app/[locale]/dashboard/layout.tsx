import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/layout/AuthGuard';

const DASHBOARD_ROLES = ['OWNER', 'BARBER', 'ADMIN'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={DASHBOARD_ROLES}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          {/* Mobile header */}
          <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">BH</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Dashboard</span>
            </div>
          </div>
          <div className="p-4 lg:p-8">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
