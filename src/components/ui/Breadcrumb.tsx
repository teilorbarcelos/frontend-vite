import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const routeMap: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Usuários',
  roles: 'Funções',
  products: 'Produtos',
  new: 'Novo',
  update: 'Editar',
};

export function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/dashboard"
            className="text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {pathnames.map((value, index) => {
          // Se o segmento anterior foi 'update', este segmento é o ID e não deve ser mostrado
          if (index > 0 && pathnames[index - 1] === 'update') return null;

          const isLast = index === pathnames.length - 1 || pathnames[index + 1] === undefined || pathnames[index] === 'update';
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const displayName = routeMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <li key={to} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1 shrink-0" />
              {isLast ? (
                <span className="text-sm font-semibold text-indigo-600 truncate max-w-[200px]">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={to}
                  className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
