import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../Select';

describe('Select', () => {
  it('renders correctly and opens', async () => {
    const user = userEvent.setup();
    render(
      <Select onValueChange={vi.fn()}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectSeparator />
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();

    await user.click(trigger);
    
    // Radix SelectContent is rendered in a Portal, but RTL should find it
    expect(await screen.findByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('selects an option', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );

    await user.click(screen.getByRole('combobox'));
    const appleOption = await screen.findByText('Apple');
    await user.click(appleOption);

    expect(onValueChange).toHaveBeenCalledWith('apple');
  });
});
