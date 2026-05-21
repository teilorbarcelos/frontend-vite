import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export const useDashboardStats = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['dashboard', 'stats', startDate, endDate],
    queryFn: () => dashboardService.getStats(startDate, endDate),
  });
};
