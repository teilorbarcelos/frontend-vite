import { api } from '@/lib/axios';

export interface TimeSeriesStat {
  date: string;
  count: number;
}

export interface UserProductStat {
  userId: string;
  userName: string;
  count: number;
}

export interface DashboardStats {
  userCreationStats: TimeSeriesStat[];
  productCreationStats: TimeSeriesStat[];
  productsPerUser: UserProductStat[];
}

export const dashboardService = {
  getStats: async (startDate?: Date, endDate?: Date): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (startDate) params.append('createdAt_start', formatDate(startDate));
    if (endDate) params.append('createdAt_end', formatDate(endDate));
    
    const { data } = await api.get<DashboardStats>(`/v1/dashboard/stats?${params.toString()}`);
    return data;
  },
};
