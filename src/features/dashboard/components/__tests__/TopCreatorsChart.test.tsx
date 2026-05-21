import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TopCreatorsChart } from '../TopCreatorsChart';
import type { UserProductStat } from '../../services/dashboard.service';

vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ data, children }: { data: UserProductStat[]; children: ReactNode }) => (
      <div data-testid="bar-chart">
        {data.map((item: UserProductStat, idx: number) => (
          <span key={idx} data-testid="chart-point">{item.userName}: {item.count}</span>
        ))}
        {children}
      </div>
    ),
    Bar: ({ children }: { children: ReactNode }) => <div data-testid="chart-bar">{children}</div>,
    YAxis: ({ tickFormatter }: { tickFormatter?: (value: string) => string }) => {
      if (tickFormatter) {
        expect(tickFormatter('u1')).toBe('User One');
        expect(tickFormatter('u999')).toBe('u999');
      }
      return null;
    },
    Tooltip: ({ labelFormatter }: { labelFormatter?: (value: string) => string }) => {
      if (labelFormatter) {
        expect(labelFormatter('u1')).toBe('User One');
        expect(labelFormatter('u999')).toBe('u999');
      }
      return null;
    },
    Cell: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
  };
});

describe('TopCreatorsChart', () => {
  const mockData = [
    { userId: 'u1', userName: 'User One', count: 12 },
    { userId: 'u2', userName: 'User Two', count: 8 },
  ];

  it('renders top creators chart correctly', () => {
    render(<TopCreatorsChart data={mockData} />);

    expect(screen.getByText('Top Criadores (Produtos)')).toBeInTheDocument();
    expect(screen.getByText('Usuários que mais cadastraram produtos.')).toBeInTheDocument();

    // Verify mock rendered user names and counts
    expect(screen.getByText('User One: 12')).toBeInTheDocument();
    expect(screen.getByText('User Two: 8')).toBeInTheDocument();
  });
});
