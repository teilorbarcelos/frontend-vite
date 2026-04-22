import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Calendar } from '../Calendar';

describe('Calendar', () => {
  it('renders correctly', () => {
    const { container } = render(<Calendar />);
    expect(container.querySelector('.rdp-root')).toBeInTheDocument();
  });

  it('handles date selection', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    
    // Use a fixed date to ensure consistent testing
    const selectedDate = new Date(2024, 0, 15); // Jan 15, 2024
    
    render(
      <Calendar 
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        month={new Date(2024, 0)}
      />
    );

    const day16 = screen.getByText('16');
    await user.click(day16);

    expect(onSelect).toHaveBeenCalled();
  });

  it('renders month and year dropdowns', async () => {
    render(
      <Calendar 
        captionLayout="dropdown"
        month={new Date(2024, 0)}
      />
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2); // Month and Year
  });

  it('changes month via dropdown', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    
    render(
      <Calendar 
        captionLayout="dropdown"
        month={new Date(2024, 0)}
        onMonthChange={onMonthChange}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const monthSelect = selects[0]; // Assuming first is month

    await user.click(monthSelect);
    
    // Find February in the list
    const february = await screen.findByText(/february/i);
    await user.click(february);

    expect(onMonthChange).toHaveBeenCalled();
  });
});
