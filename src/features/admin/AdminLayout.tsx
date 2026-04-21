import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, LayoutDashboard, Users, Shield, Package } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, feature: 'dashboard' },
    { name: 'Perfis', path: '/roles', icon: Shield, feature: 'role' },
    { name: 'Usuários', path: '/users', icon: Users, feature: 'user' },
    { name: 'Produtos', path: '/products', icon: Package, feature: 'product' },
  ].filter(item => !item.feature || hasPermission(item.feature, 'view'));

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <span className="text-xl font-bold text-gray-800">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-4 py-2 rounded-md transition-colors',
                  isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <UserIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{user?.name || 'User'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 flex flex-col min-h-0 p-6">
          <Breadcrumb />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
