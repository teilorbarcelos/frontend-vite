import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTableActions } from '../DataTableActions';

describe('DataTableActions', () => {
  it('renders nothing when no actions are provided', () => {
    const { container } = render(<DataTableActions id="1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a single button when only one action is provided', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<DataTableActions id="1" onEdit={onEdit} />);
    
    const editButton = screen.getByTitle('Editar');
    expect(editButton).toBeInTheDocument();
    
    await user.click(editButton);
    expect(onEdit).toHaveBeenCalledWith('1');
  });

  it('renders a dropdown when multiple actions are provided', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    
    render(<DataTableActions id="1" onEdit={onEdit} onDelete={onDelete} />);
    
    const trigger = screen.getByRole('button', { name: /Abrir menu/i });
    await user.click(trigger);
    
    expect(await screen.findByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });

  it('opens confirmation modal when delete is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    
    render(<DataTableActions id="1" onDelete={onDelete} />);
    
    const deleteButton = screen.getByTitle('Excluir');
    await user.click(deleteButton);
    
    expect(await screen.findByText('Confirmar Exclusão')).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);
    
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('handles cancellation of delete', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    
    render(<DataTableActions id="1" onDelete={onDelete} />);
    
    await user.click(screen.getByTitle('Excluir'));
    
    const cancelButton = await screen.findByText('Cancelar');
    await user.click(cancelButton);
    
    expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('renders extra actions', async () => {
    const extraAction = vi.fn();
    const user = userEvent.setup();
    
    render(
      <DataTableActions 
        id="1" 
        onEdit={() => {}} 
        extraActions={[{ label: 'Custom', onClick: extraAction }]} 
      />
    );
    
    await user.click(screen.getByRole('button', { name: /Abrir menu/i }));
    
    const customItem = await screen.findByText('Custom');
    await user.click(customItem);
    
    expect(extraAction).toHaveBeenCalledWith('1');
  });
});
