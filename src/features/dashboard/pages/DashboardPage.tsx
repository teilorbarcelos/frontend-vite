import { subDays } from 'date-fns';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Loader2 } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';

import { ProductCreationsChart } from '../components/ProductCreationsChart';
import { SummaryCards } from '../components/SummaryCards';
import { TopCreatorsChart } from '../components/TopCreatorsChart';
import { UserCreationsChart } from '../components/UserCreationsChart';

export function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: stats, isLoading, isError } = useDashboardStats(dateRange?.from, dateRange?.to);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-red-500">
        <p>Erro ao carregar os dados do dashboard.</p>
      </div>
    );
  }

  const totalUsers = stats?.userCreationStats.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const totalProducts = stats?.productCreationStats.reduce((acc, curr) => acc + curr.count, 0) || 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 overflow-y-auto min-h-0 bg-gray-50">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DateRangePicker 
            value={dateRange} 
            onChange={setDateRange} 
            className="w-[300px]" 
          />
        </div>
      </div>

      {isLoading || !stats ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          <SummaryCards totalUsers={totalUsers} totalProducts={totalProducts} />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <UserCreationsChart data={stats.userCreationStats} />
            <TopCreatorsChart data={stats.productsPerUser} />
            <ProductCreationsChart data={stats.productCreationStats} />
          </div>
        </>
      )}
    </div>
  );
}

