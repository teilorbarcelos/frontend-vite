import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoadingProvider } from '@/providers/LoadingProvider';
import { useLoading } from '@/hooks/useLoading';
import { useLoadingStore } from '@/stores/loading';
import React from 'react';

const TestComponent = () => {
  const { showLoading, hideLoading } = useLoading();
  return (
    <div>
      <button onClick={() => showLoading('Wait a bit...')}>Show</button>
      <button onClick={() => hideLoading()}>Hide</button>
    </div>
  );
};

describe('LoadingStore', () => {
  beforeEach(() => {
    useLoadingStore.setState({ isLoading: false, message: 'Carregando...' });
  });

  it('shows and hides loading overlay', async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    expect(screen.queryByText('Wait a bit...')).not.toBeInTheDocument();

    const showButton = screen.getByText('Show');
    act(() => {
      showButton.click();
    });

    expect(screen.getByText('Wait a bit...')).toBeInTheDocument();

    const hideButton = screen.getByText('Hide');
    act(() => {
      hideButton.click();
    });

    expect(screen.queryByText('Wait a bit...')).not.toBeInTheDocument();
  });

  it('uses default message if none provided', () => {
    const CustomTrigger = () => {
      const { showLoading } = useLoading();
      return <button onClick={() => showLoading()}>Show Default</button>;
    };

    render(
      <LoadingProvider>
        <CustomTrigger />
      </LoadingProvider>
    );

    const showButton = screen.getByText('Show Default');
    act(() => {
      showButton.click();
    });

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });
});
