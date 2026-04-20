import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { userService } from '../services/user.service';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { getUserColumns } from '../constants/userHeaderMap';

export function UserListPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, size],
    queryFn: () => userService.getUsers(page, size),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => userService.toggleStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const columns = getUserColumns(
    (id, active) => toggleStatusMutation.mutate({ id, active }),
    (id) => navigate(`/users/${id}`),
    (id) => deleteMutation.mutate(id)
  );

  if (isLoading) return <div className="p-8 text-center text-gray-500">Carregando usuários...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar usuários</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <Button onClick={() => navigate('/users/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <DataTable
        data={data?.items || []}
        headerMap={columns}
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
