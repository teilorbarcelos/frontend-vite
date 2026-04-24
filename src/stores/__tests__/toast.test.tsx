import { describe, it, expect, beforeEach } from 'vitest';
import { useToastStore } from '../toast';

describe('ToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('adds a generic toast', () => {
    const { toast } = useToastStore.getState();
    toast({ description: 'Generic', title: 'Test', variant: 'info' });
    
    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].description).toBe('Generic');
    expect(state.toasts[0].id).toBeDefined();
  });

  it('adds a success toast', () => {
    const { success } = useToastStore.getState();
    success('Success message');
    
    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].variant).toBe('success');
    expect(state.toasts[0].description).toBe('Success message');
  });

  it('adds an error toast', () => {
    const { error } = useToastStore.getState();
    error('Error message');
    
    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].variant).toBe('error');
  });

  it('adds an info toast', () => {
    const { info } = useToastStore.getState();
    info('Info message');
    
    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].variant).toBe('info');
  });

  it('adds a warning toast', () => {
    const { warning } = useToastStore.getState();
    warning('Warning message');
    
    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].variant).toBe('warning');
  });

  it('removes a toast', () => {
    const { success, removeToast } = useToastStore.getState();
    success('Message');
    const id = useToastStore.getState().toasts[0].id;
    
    removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
