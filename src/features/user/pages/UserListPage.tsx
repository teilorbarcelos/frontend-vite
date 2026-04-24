import { DataTable } from '@/components/ui/DataTable';
import { useAuth } from '@/hooks/useAuth';
import { useDataTable } from '@/hooks/useDataTable';
import { useToast } from '@/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageHeader } from '@/components/ui/ListPageHeader';
import { UserFilters } from '../components/UserFilters';
import { USER_SEARCHABLE_FIELDS as searchFields } from '../constants/user.constants';
import { getUserColumns } from '../constants/userHeaderMap';
import { userService } from '../services/user.service';

export function UserListPage() {
  const {
    page,
    size,
    searchWord,
    filters,
    sort,
    handleSearch,
    handleFilter,
    tableProps: dataTableProps
  } = useDataTable();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const permissions = useMemo(() => ({
    canCreate: hasPermission('user', 'create'),
    canUpdate: hasPermission('user', 'create'),
    canDelete: hasPermission('user', 'delete'),
  }), [hasPermission]);

  const { data, isError, isFetching } = useQuery({
    queryKey: ['users', page, size, searchWord, filters, sort],
    queryFn: () => userService.getUsers({
      page, 
      size, 
      searchWord, 
      searchFields, 
      filters,
      sort,
      all: true
    }),
    placeholderData: (previousData) => previousData,
  });

  const { success, error: toastError } = useToast();

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => userService.toggleStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Status do usuário atualizado!');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toastError(err.response?.data?.message || 'Erro ao atualizar status.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Usuário excluído com sucesso!');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toastError(err.response?.data?.message || 'Erro ao excluir usuário.');
    }
  });

  const columns = getUserColumns(
    (id, active) => toggleStatusMutation.mutate({ id, active }),
    (id) => navigate(`/users/update/${id}`),
    (id) => deleteMutation.mutate(id),
    permissions
  );

  if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar usuários</div>;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ListPageHeader
        title="Usuários"
        onSearch={handleSearch}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={Object.keys(filters).length}
        onCreateClick={permissions.canCreate ? () => navigate('/users/new') : undefined}
        createLabel="Novo Usuário"
      />

      <UserFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilter={handleFilter}
        initialValues={filters}
      />

      <DataTable
        {...dataTableProps}
        data={data?.items || []}
        headerMap={columns}
        isLoading={isFetching}
        totalItems={data?.total || 0}
      />
    </div>
  );
}
