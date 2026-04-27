import { DataTable } from '@/components/ui/DataTable';
import { useAuth } from '@/hooks/useAuth';
import { useDataTable } from '@/hooks/useDataTable';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageHeader } from '@/components/ui/ListPageHeader';
import { RoleFilters } from '../components/RoleFilters';
import { ROLE_SEARCHABLE_FIELDS as searchFields } from '../constants/role.constants';
import { getRoleColumns } from '../constants/roleHeaderMap';
import { roleService } from '../services/role.service';
import { roleMutations } from '../hooks/role.mutations';

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
  const { hasPermission } = useAuth();

  const permissions = useMemo(() => ({
    canCreate: hasPermission('role', 'create'),
    canUpdate: hasPermission('role', 'update'),
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

  const toggleStatusMutation = roleMutations.useToggleStatus();
  const deleteMutation = roleMutations.useDelete();

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
