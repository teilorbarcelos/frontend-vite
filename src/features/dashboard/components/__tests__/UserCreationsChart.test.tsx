import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { UserCreationsChart } from '../UserCreationsChart';
import type { TimeSeriesStat } from '../../services/dashboard.service';

interface ChartPoint extends TimeSeriesStat {
  formattedDate?: string;
}

vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    AreaChart: ({ data, children }: { data: ChartPoint[]; children: ReactNode }) => (
      <div data-testid="area-chart">
        {data.map((item: ChartPoint, idx: number) => (
          <span key={idx} data-testid="chart-point">{item.formattedDate}: {item.count}</span>
        ))}
        {children}
      </div>
    ),
    Area: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => {
      if (tickFormatter) {
        expect(tickFormatter(10)).toBe('10');
      }
      return null;
    },
    Tooltip: () => null,
  };
});

describe('UserCreationsChart', () => {
  it('renders the chart and formats date labels correctly, handling empty and invalid dates', () => {
    const mockData = [
      { date: '2026-05-01', count: 5 },
      { date: '', count: 2 },
      { date: '2026-05', count: 3 },
    ];
    render(<UserCreationsChart data={mockData} />);

    expect(screen.getByText('Criação de Usuários')).toBeInTheDocument();
    expect(screen.getByText('Evolução diária de registros no período.')).toBeInTheDocument();

    // Verify mock rendered formatted dates & counts
    expect(screen.getByText('01/05/2026: 5')).toBeInTheDocument();
    expect(screen.getByText(': 2')).toBeInTheDocument();
    expect(screen.getByText('2026-05: 3')).toBeInTheDocument();
  });
});
