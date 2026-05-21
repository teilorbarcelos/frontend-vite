import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SummaryCards } from '../SummaryCards';

describe('SummaryCards', () => {
  it('renders summary cards with correct values', () => {
    render(<SummaryCards totalUsers={42} totalProducts={123} />);

    expect(screen.getByText('Novos Usuários')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    expect(screen.getByText('Novos Produtos')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});
