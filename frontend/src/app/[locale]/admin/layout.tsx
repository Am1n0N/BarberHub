import AdminSidebar from '@/components/admin/AdminSidebar';
import AuthGuard from '@/components/layout/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Admin</span>
            </div>
          </div>
          <div className="p-4 lg:p-8">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
