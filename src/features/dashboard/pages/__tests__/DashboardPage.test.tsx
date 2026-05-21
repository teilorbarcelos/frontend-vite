import { renderWithProviders } from '@/test/utils';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { DashboardPage } from '../DashboardPage';
import type { TimeSeriesStat, UserProductStat } from '../../services/dashboard.service';
import type { DateRange } from 'react-day-picker';

vi.mock('../../hooks/useDashboardStats', () => ({
  useDashboardStats: vi.fn(),
}));

vi.mock('../../components/SummaryCards', () => ({
  SummaryCards: ({ totalUsers, totalProducts }: { totalUsers: number; totalProducts: number }) => (
    <div data-testid="summary-cards">
      <span>Users: {totalUsers}</span>
      <span>Products: {totalProducts}</span>
    </div>
  ),
}));

vi.mock('../../components/UserCreationsChart', () => ({
  UserCreationsChart: ({ data }: { data: TimeSeriesStat[] }) => (
    <div data-testid="user-creations-chart">
      {data.map((item: TimeSeriesStat, idx: number) => (
        <span key={idx}>{item.date}: {item.count}</span>
      ))}
    </div>
  ),
}));

vi.mock('../../components/TopCreatorsChart', () => ({
  TopCreatorsChart: ({ data }: { data: UserProductStat[] }) => (
    <div data-testid="top-creators-chart">
      {data.map((item: UserProductStat, idx: number) => (
        <span key={idx}>{item.userId}: {item.count}</span>
      ))}
    </div>
  ),
}));

vi.mock('../../components/ProductCreationsChart', () => ({
  ProductCreationsChart: ({ data }: { data: TimeSeriesStat[] }) => (
    <div data-testid="product-creations-chart">
      {data.map((item: TimeSeriesStat, idx: number) => (
        <span key={idx}>{item.date}: {item.count}</span>
      ))}
    </div>
  ),
}));

vi.mock('@/components/ui/DateRangePicker', () => ({
  DateRangePicker: ({ onChange }: { _: unknown; onChange: (value: DateRange | undefined) => void }) => (
    <div data-testid="date-range-picker">
      <button 
        data-testid="trigger-change" 
        onClick={() => onChange({ from: new Date('2026-05-10'), to: new Date('2026-05-20') })}
      >
        Change Date
      </button>
    </div>
  ),
}));

describe('DashboardPage', () => {
  const mockStats = {
    userCreationStats: [
      { date: '2026-05-01', count: 5 },
      { date: '2026-05-02', count: 10 },
    ],
    productCreationStats: [
      { date: '2026-05-01', count: 2 },
      { date: '2026-05-02', count: 3 },
    ],
    productsPerUser: [
      { userId: 'u1', userName: 'User One', count: 5 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useDashboardStats as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useDashboardStats as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Erro ao carregar os dados do dashboard.')).toBeInTheDocument();
  });

  it('renders stats data and updates stats query when date changes', async () => {
    (useDashboardStats as Mock).mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<DashboardPage />);

    // Verify Title
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Verify Summary Cards calculations (totalUsers = 15, totalProducts = 5)
    expect(screen.getByText('Users: 15')).toBeInTheDocument();
    expect(screen.getByText('Products: 5')).toBeInTheDocument();

    // Verify charts data are rendered
    expect(screen.getByTestId('user-creations-chart')).toBeInTheDocument();
    expect(screen.getByText('2026-05-01: 5')).toBeInTheDocument();
    expect(screen.getByText('2026-05-02: 10')).toBeInTheDocument();

    expect(screen.getByTestId('product-creations-chart')).toBeInTheDocument();
    expect(screen.getByText('2026-05-01: 2')).toBeInTheDocument();
    expect(screen.getByText('2026-05-02: 3')).toBeInTheDocument();

    expect(screen.getByTestId('top-creators-chart')).toBeInTheDocument();
    expect(screen.getByText('u1: 5')).toBeInTheDocument();

    // Trigger date range change
    const changeBtn = screen.getByTestId('trigger-change');
    fireEvent.click(changeBtn);

    // Verify that useDashboardStats was called with the new date parameters on re-render
    expect(useDashboardStats).toHaveBeenLastCalledWith(
      new Date('2026-05-10'),
      new Date('2026-05-20')
    );
  });
});
