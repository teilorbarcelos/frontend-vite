import { DataTable } from '@/components/ui/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { useDataTable } from '@/hooks/useDataTable';
import { useToast } from '@/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageHeader } from '@/components/ui/ListPageHeader';
import { RoleFilters } from '../components/RoleFilters';
import { ROLE_SEARCHABLE_FIELDS as searchFields } from '../constants/role.constants';
import { getRoleColumns } from '../constants/roleHeaderMap';
import { roleService } from '../services/role.service';

export function RoleListPage() {
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
    canCreate: hasPermission('role', 'create'),
    canUpdate: hasPermission('role', 'create'),
    canDelete: hasPermission('role', 'delete'),
  }), [hasPermission]);

  const { data, isError, isFetching } = useQuery({
    queryKey: ['roles', page, size, searchWord, filters, sort],
    queryFn: () => roleService.getRoles({
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
    mutationFn: ({ id, active }: { id: string; active: boolean }) => roleService.toggleStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      success('Status da role atualizado!');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toastError(err.response?.data?.message || 'Erro ao atualizar status.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      success('Role excluída com sucesso!');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toastError(err.response?.data?.message || 'Erro ao excluir role.');
    }
  });

  const columns = getRoleColumns(
    (id, active) => toggleStatusMutation.mutate({ id, active }),
    (id) => navigate(`/roles/update/${id}`),
    (id) => deleteMutation.mutate(id),
    permissions
  );

  if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar roles</div>;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ListPageHeader
        title="Roles"
        onSearch={handleSearch}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={Object.keys(filters).length}
        onCreateClick={permissions.canCreate ? () => navigate('/roles/new') : undefined}
        createLabel="Nova Role"
      />

      <RoleFilters
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
