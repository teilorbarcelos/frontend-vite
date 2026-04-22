import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DateRangePicker } from '../DateRangePicker';

describe('DateRangePicker', () => {
  it('renders with placeholder when no value', () => {
    render(<DateRangePicker placeholder="Select range" />);
    expect(screen.getByText('Select range')).toBeInTheDocument();
  });

  it('renders single date when only from is provided', () => {
    const value = { from: new Date(2024, 0, 1) };
    render(<DateRangePicker value={value} />);
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
  });

  it('renders date range when both are provided', () => {
    const value = { from: new Date(2024, 0, 1), to: new Date(2024, 0, 31) };
    render(<DateRangePicker value={value} />);
    expect(screen.getByText('01/01/2024 - 31/01/2024')).toBeInTheDocument();
  });

  it('opens calendar on click', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker />);
    
    await user.click(screen.getByRole('button'));
    
    // Check for a day in the calendar (rdp class root)
    expect(document.querySelector('.rdp-root')).toBeInTheDocument();
  });

  it('calls onChange when a date is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DateRangePicker onChange={onChange} />);
    
    await user.click(screen.getByRole('button'));
    
    const day = screen.getByText('15');
    await user.click(day);

    expect(onChange).toHaveBeenCalled();
  });
});
