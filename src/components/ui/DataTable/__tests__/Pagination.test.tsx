import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('renders correctly with multiple pages', () => {
    render(
      <Pagination 
        currentPage={0} 
        totalPages={10} 
        onPageChange={vi.fn()} 
      />
    );

    expect(screen.getByText((_, element) => {
      const hasText = (node: Element) => node.textContent === 'Página 1 de 10';
      const nodeHasText = hasText(element!);
      const childrenDontHaveText = Array.from(element?.children || []).every(
        child => !hasText(child)
      );
      return nodeHasText && childrenDontHaveText;
    })).toBeInTheDocument();
    expect(screen.getByTitle('Próximo')).not.toBeDisabled();
    expect(screen.getByTitle('Anterior')).toBeDisabled();
  });

  it('calls onPageChange when page button is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination 
        currentPage={0} 
        totalPages={10} 
        onPageChange={onPageChange} 
      />
    );

    const page2Button = screen.getByText('2');
    fireEvent.click(page2Button);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when next button is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination 
        currentPage={0} 
        totalPages={10} 
        onPageChange={onPageChange} 
      />
    );

    const nextButton = screen.getByTitle('Próximo');
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when last page button is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination 
        currentPage={0} 
        totalPages={10} 
        onPageChange={onPageChange} 
      />
    );

    const lastButton = screen.getByTitle('Última página');
    fireEvent.click(lastButton);

    expect(onPageChange).toHaveBeenCalledWith(9);
  });

  it('updates page size when selected from dropdown', async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    const onPageChange = vi.fn();
    render(
      <Pagination 
        currentPage={0} 
        totalPages={10} 
        onPageChange={onPageChange} 
        pageSize={25}
        onPageSizeChange={onPageSizeChange}
      />
    );

    const pageSizeTrigger = screen.getByText('25');
    await user.click(pageSizeTrigger);

    const option50 = await screen.findByText('50');
    await user.click(option50);

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(onPageChange).toHaveBeenCalledWith(0);
  });

  it('shows info text when totalItems is provided', () => {
    render(
      <Pagination 
        currentPage={0} 
        totalPages={4} 
        onPageChange={vi.fn()} 
        pageSize={25}
        totalItems={100}
      />
    );

    expect(screen.getByText(/Exibindo/)).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('returns null if only one page and no pageSizeChange', () => {
    const { container } = render(
      <Pagination 
        currentPage={0} 
        totalPages={1} 
        onPageChange={vi.fn()} 
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders ellipsis for large page counts', () => {
    render(
      <Pagination 
        currentPage={5} 
        totalPages={20} 
        onPageChange={vi.fn()} 
      />
    );

    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('calls onPageChange when first page and previous buttons are clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination 
        currentPage={5} 
        totalPages={10} 
        onPageChange={onPageChange} 
      />
    );

    const firstButton = screen.getByTitle('Primeira página');
    fireEvent.click(firstButton);
    expect(onPageChange).toHaveBeenCalledWith(0);

    const prevButton = screen.getByTitle('Anterior');
    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('handles mobile pagination buttons', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination 
        currentPage={1} 
        totalPages={10} 
        onPageChange={onPageChange} 
      />
    );

    const mobilePrev = screen.getByText('Anterior');
    fireEvent.click(mobilePrev);
    expect(onPageChange).toHaveBeenCalledWith(0);

    const mobileNext = screen.getByText('Próximo');
    fireEvent.click(mobileNext);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
