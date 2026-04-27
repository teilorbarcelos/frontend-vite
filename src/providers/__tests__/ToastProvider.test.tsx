import { useToast } from '@/hooks/useToast';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../ToastProvider';

const TestComponent = () => {
  const { success, error, info, warning, toast } = useToast();
  return (
    <div>
      <button onClick={() => success('Success message')}>Success</button>
      <button onClick={() => error('Error message')}>Error</button>
      <button onClick={() => info('Info message')}>Info</button>
      <button onClick={() => warning('Warning message')}>Warning</button>
      <button onClick={() => toast({ title: 'With Duration', description: 'Has duration', duration: 5000 })}>With Duration</button>
      <button onClick={() => toast({ title: 'Explicit Default', description: 'Explicit default variant', variant: 'default', duration: 3000 })}>Explicit Default</button>
      <button onClick={() => toast({ title: 'Default', description: 'Default message', duration: 3000 })}>Default</button>
    </div>
  );
};

describe('ToastProvider', () => {
  it('shows toast with duration', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'With Duration' }));
    expect(screen.getByText('Has duration')).toBeInTheDocument();
  });

  it('shows explicit default toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Explicit Default' }));
    expect(screen.getByText('Explicit default variant')).toBeInTheDocument();
  });

  it('shows success and error toasts', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    await user.click(screen.getByText('Error'));
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('shows info and warning toasts', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Info'));
    expect(screen.getByText('Info message')).toBeInTheDocument();

    await user.click(screen.getByText('Warning'));
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('shows default toast without variant', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Default' }));
    expect(screen.getByText('Default message')).toBeInTheDocument();
    expect(screen.getAllByText('Default')).toHaveLength(2); // One button, one title
  });

  it('removes toast when closed and handles internal states', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Opening
    act(() => {
      screen.getByText('Success').click();
    });
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Closing - this triggers handleOpenChange(false)
    const closeBtn = screen.getByRole('button', { name: /Fechar/i });
    act(() => {
      closeBtn.click();
    });

    // Advance time to trigger setTimeout(onRemove, 500)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Now it should definitely be gone from the provider's state
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    
    vi.useRealTimers();
  });
});
