import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { userService } from '../services/user.service';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';

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

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error loading users</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Button onClick={() => navigate('/users/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New User
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items?.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
              <TableCell className="text-gray-500">{user.email}</TableCell>
              <TableCell>
                <button
                  onClick={() => toggleStatusMutation.mutate({ id: user.id, active: !user.active })}
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                    user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.active ? 'Active' : 'Inactive'}
                </button>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/users/${user.id}`)}>
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  if (confirm('Are you sure you want to delete this user?')) {
                    deleteMutation.mutate(user.id);
                  }
                }}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!data?.items?.length && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {data?.total > 0 && (
        <Pagination
          page={page}
          total={data.total}
          size={size}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      )}
    </div>
  );
}
