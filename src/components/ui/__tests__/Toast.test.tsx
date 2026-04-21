import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastIcon, ToastProgress } from '../Toast';
import React from 'react';

describe('Toast Components', () => {
  it('renders ToastIcon for different variants', () => {
    const { container, rerender } = render(<ToastIcon variant="success" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    
    rerender(<ToastIcon variant="error" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    
    rerender(<ToastIcon variant="warning" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    
    rerender(<ToastIcon variant="info" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    
    rerender(<ToastIcon variant="default" />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders ToastProgress when duration is provided', () => {
    const { container, rerender } = render(<ToastProgress duration={3000} variant="success" />);
    expect(container.firstChild).toBeDefined();
    
    rerender(<ToastProgress duration={3000} variant="error" />);
    rerender(<ToastProgress duration={3000} variant="warning" />);
    rerender(<ToastProgress duration={3000} variant="info" />);
    rerender(<ToastProgress duration={3000} variant="default" />);
  });

  it('does not render ToastProgress when duration is missing', () => {
    const { container } = render(<ToastProgress />);
    expect(container.firstChild).toBeNull();
  });
});
