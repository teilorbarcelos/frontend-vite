import { render, screen, } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterDrawer, type FilterField } from '../FilterDrawer';

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

  it('handles only end date in initial values', () => {
    const fields: FilterField[] = [
      { name: 'date', label: 'Date', type: 'dateRange' }
    ];
    render(
      <FilterDrawer
        isOpen={true}
        onClose={vi.fn()}
        onFilter={vi.fn()}
        fields={fields}
        initialValues={{ date_end: '2023-12-31' }}
      />
    );
    expect(screen.getByText('Selecione um período')).toBeInTheDocument();
  });

  it('handles range without "to" in submission (explicitly)', async () => {
    const onFilter = vi.fn();
    const fields: FilterField[] = [
      { name: 'date', label: 'Date', type: 'dateRange' }
    ];
    const user = userEvent.setup();
    render(
      <FilterDrawer
        isOpen={true}
        onClose={vi.fn()}
        onFilter={onFilter}
        fields={fields}
      />
    );
    
    await user.click(screen.getByText('Selecione um período'));
    await user.click(screen.getByText('10'));
    await user.click(screen.getByText('Aplicar'));
    
    expect(onFilter).toHaveBeenCalledWith({
      date_start: expect.stringMatching(/\d{4}-\d{2}-10/),
      date_end: expect.stringMatching(/\d{4}-\d{2}-10/)
    });
  });

  it('handles empty range in submission', async () => {
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
        initialValues={{ date: {} }} 
      />
    );
    
    await userEvent.click(screen.getByText('Aplicar'));
    expect(onFilter).toHaveBeenCalledWith({});
  });

  it('handles full date range in submission', async () => {
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
        initialValues={{ date_start: '2023-01-01', date_end: '2023-01-31' }}
      />
    );
    
    await userEvent.click(screen.getByText('Aplicar'));
    expect(onFilter).toHaveBeenCalledWith({
      date_start: '2023-01-01',
      date_end: '2023-01-31'
    });
  });

  it('handles selecting both dates in the picker', async () => {
    const onFilter = vi.fn();
    const fields: FilterField[] = [
      { name: 'date', label: 'Date', type: 'dateRange' }
    ];
    const user = userEvent.setup();
    render(
      <FilterDrawer
        isOpen={true}
        onClose={vi.fn()}
        onFilter={onFilter}
        fields={fields}
      />
    );
    
    await user.click(screen.getByText('Selecione um período'));
    await user.click(screen.getByText('10')); // From
    await user.click(screen.getByText('20')); // To
    await user.click(screen.getByText('Aplicar'));
    
    expect(onFilter).toHaveBeenCalledWith({
      date_start: expect.stringMatching(/\d{4}-\d{2}-10/),
      date_end: expect.stringMatching(/\d{4}-\d{2}-20/)
    });
  });
});
