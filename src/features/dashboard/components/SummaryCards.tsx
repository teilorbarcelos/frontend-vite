import { Package, Users } from 'lucide-react';

interface SummaryCardsProps {
  totalUsers: number;
  totalProducts: number;
}

export function SummaryCards({ totalUsers, totalProducts }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Novos Usuários</p>
          <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
        </div>
        <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
          <Users size={20} />
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Novos Produtos</p>
          <h3 className="text-2xl font-bold text-gray-900">{totalProducts}</h3>
        </div>
        <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
          <Package size={20} />
        </div>
      </div>
    </div>
  );
}
