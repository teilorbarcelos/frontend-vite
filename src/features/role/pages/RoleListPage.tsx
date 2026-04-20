import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE_SEARCHABLE_FIELDS as searchFields } from '../constants/role.constants';
import { getRoleColumns } from '../constants/roleHeaderMap';
import { RoleFilters } from '../components/RoleFilters';
import { roleService } from '../services/role.service';
import { useDataTable } from '@/hooks/useDataTable';

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

  const { data, isError, isFetching } = useQuery({
    queryKey: ['roles', page, size, searchWord, filters, sort],
    queryFn: () => roleService.getRoles({
      page, 
      size, 
      searchWord, 
      searchFields, 
      filters,
      sort
    }),
    placeholderData: (prev) => prev,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => roleService.toggleStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const columns = getRoleColumns(
    (id, active) => toggleStatusMutation.mutate({ id, active }),
    (id) => navigate(`/roles/update/${id}`),
    (id) => deleteMutation.mutate(id)
  );

  if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar funções</div>;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Funções</h1>
        <div className="flex items-center space-x-4">
          <SearchInput 
            onSearch={handleSearch} 
            className="w-80"
          />
          <Button 
            variant="secondary" 
            onClick={() => setIsFilterOpen(true)}
            className={Object.keys(filters).length > 0 ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {Object.keys(filters).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
          <Button onClick={() => navigate('/roles/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Função
          </Button>
        </div>
      </div>

      <RoleFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilter={handleFilter}
        initialValues={filters}
      />

      <DataTable
        data={data?.items || []}
        headerMap={columns}
        isLoading={isFetching}
        {...dataTableProps}
        paginationProps={{
          ...dataTableProps.paginationProps,
          totalPages: data?.total ? Math.ceil(data.total / size) : 0,
          totalItems: data?.total,
        }}
      />
    </div>
  );
}
