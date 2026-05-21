import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ProductCreationsChart } from '../ProductCreationsChart';
import type { TimeSeriesStat } from '../../services/dashboard.service';

interface ChartPoint extends TimeSeriesStat {
  formattedDate?: string;
}

vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ data, children }: { data: ChartPoint[]; children: ReactNode }) => (
      <div data-testid="bar-chart">
        {data.map((item: ChartPoint, idx: number) => (
          <span key={idx} data-testid="chart-point">{item.formattedDate}: {item.count}</span>
        ))}
        {children}
      </div>
    ),
    Bar: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  };
});

describe('ProductCreationsChart', () => {
  it('renders product creations chart correctly and handles empty and invalid dates', () => {
    const mockData = [
      { date: '2026-05-01', count: 15 },
      { date: '', count: 5 },
      { date: '2026-05', count: 10 },
    ];
    render(<ProductCreationsChart data={mockData} />);

    expect(screen.getByText('Criação de Produtos')).toBeInTheDocument();
    expect(screen.getByText('Volume de produtos cadastrados por dia.')).toBeInTheDocument();

    // Verify mock rendered formatted dates & counts
    expect(screen.getByText('01/05/2026: 15')).toBeInTheDocument();
    expect(screen.getByText(': 5')).toBeInTheDocument();
    expect(screen.getByText('2026-05: 10')).toBeInTheDocument();
  });
});
