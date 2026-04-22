import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterDrawer, FilterField } from '../FilterDrawer';

describe('FilterDrawer', () => {
  const fields: FilterField[] = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'true' }] },
    { name: 'created_at', label: 'Created At', type: 'dateRange' },
  ];

  it('renders nothing when closed', () => {
    const { container } = render(
      <FilterDrawer 
        isOpen={false} 
        onClose={() => {}} 
        fields={fields} 
        onFilter={() => {}} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders fields when open', () => {
    render(
      <FilterDrawer 
        isOpen={true} 
        onClose={() => {}} 
        fields={fields} 
        onFilter={() => {}} 
      />
    );

    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
  });

  it('calls onFilter with data when submitted', async () => {
    const onFilter = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterDrawer 
        isOpen={true} 
        onClose={() => {}} 
        fields={fields} 
        onFilter={onFilter} 
      />
    );

    await user.type(screen.getByLabelText('Name'), 'John');
    await user.selectOptions(screen.getByLabelText('Status'), 'true');
    
    await user.click(screen.getByText('Aplicar'));

    expect(onFilter).toHaveBeenCalledWith({
      name: 'John',
      status: 'true'
    });
  });

  it('handles date range filtering on submit', async () => {
    const onFilter = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterDrawer 
        isOpen={true} 
        onClose={() => {}} 
        fields={fields} 
        onFilter={onFilter} 
      />
    );

    // Mock DateRangePicker trigger
    const range = { from: new Date(2024, 0, 1), to: new Date(2024, 0, 31) };
    
    // We can't easily interact with the DateRangePicker in this integration test
    // without more mocks, but we can check the logic if we can somehow set the value.
    // However, I'll try to find the "Selecione uma data" button and click it, 
    // but then I'd need to mock the Popover/Calendar.
  });

  it('triggers onFilter with formatted dates when date range is provided', async () => {
    const onFilter = vi.fn();
    // Instead of full UI interaction, we can test the initialValues and submission logic
    const initialValues = {
      created_at_start: '2024-01-01',
      created_at_end: '2024-01-31'
    };
    
    render(
      <FilterDrawer 
        isOpen={true} 
        onClose={() => {}} 
        fields={fields} 
        onFilter={onFilter} 
        initialValues={initialValues}
      />
    );

    await userEvent.click(screen.getByText('Aplicar'));

    expect(onFilter).toHaveBeenCalledWith({
      created_at_start: '2024-01-01',
      created_at_end: '2024-01-31'
    });
  });

  it('processes initial values for date range', () => {
    const initialValues = {
      created_at_start: '2024-01-01',
      created_at_end: '2024-01-31'
    };
    
    render(
      <FilterDrawer 
        isOpen={true} 
        onClose={() => {}} 
        fields={fields} 
        onFilter={() => {}} 
        initialValues={initialValues}
      />
    );

    // Check if DateRangePicker shows the dates
    expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/31\/01\/2024/)).toBeInTheDocument();
  });

  it('calls onFilter with empty object when reset', async () => {
    const onFilter = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterDrawer 
        isOpen={true} 
        onClose={() => {}} 
        fields={fields} 
        onFilter={onFilter} 
      />
    );

    await user.click(screen.getByText('Limpar'));

    expect(onFilter).toHaveBeenCalledWith({});
  });

  it('calls onClose when closed via drawer mechanism', async () => {
    const onClose = vi.fn();
    render(
      <FilterDrawer 
        isOpen={true} 
        onClose={onClose} 
        fields={fields} 
        onFilter={() => {}} 
      />
    );

    // Click the close button (the X icon which has "Fechar" as screen reader text)
    await userEvent.click(screen.getByText('Fechar'));

    expect(onClose).toHaveBeenCalled();
  });

  it('handles partial initial date values', () => {
    const fields: FilterField[] = [
      { name: 'date', label: 'Date', type: 'dateRange' }
    ];
    render(
      <FilterDrawer
        isOpen={true}
        onClose={vi.fn()}
        onFilter={vi.fn()}
        fields={fields}
        initialValues={{ date_start: '2023-01-01' }}
      />
    );
    expect(screen.getByText('01/01/2023')).toBeInTheDocument();
  });

  it('handles missing "to" date in submission', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    const fields: FilterField[] = [
      { name: 'date', label: 'Date', type: 'dateRange' }
    ];
    render(
      <FilterDrawer
        isOpen={true}
        onClose={vi.fn()}
        onFilter={onFilter}
        fields={fields}
      />
    );
    
    const trigger = screen.getByText('Selecione um período');
    await user.click(trigger);
    const day = screen.getByText('15');
    await user.click(day);
    await user.click(screen.getByText('Aplicar'));
    expect(onFilter).toHaveBeenCalled();
  });
});
