import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoleColumns } from '../constants/roleHeaderMap';
import type { Role } from '../services/role.service';
import { roleService } from '../services/role.service';

export function RoleListPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [searchWord, setSearchWord] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSearch = useCallback((val: string) => {
    setSearchWord(val);
    setPage(0);
  }, []);

  const searchableFields: (keyof Role)[] = ['name'];

  const { data, isError, isFetching } = useQuery({
    queryKey: ['roles', page, size, searchWord],
    queryFn: () => roleService.getRoles(page, size, searchWord, searchableFields.join(',')),
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
          <Button onClick={() => navigate('/roles/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Função
          </Button>
        </div>
      </div>

      <DataTable
        data={data?.items || []}
        headerMap={columns}
        isLoading={isFetching}
        paginationProps={
          data?.total > 0
            ? {
                currentPage: page,
                totalPages: Math.ceil(data.total / size),
                onPageChange: setPage,
                pageSize: size,
                totalItems: data.total,
                onPageSizeChange: setSize,
              }
            : undefined
        }
      />
    </div>
  );
}
