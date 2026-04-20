import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const roleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  RoleFeature: z.string().min(1, 'Role feature is required'),
});

type RoleForm = z.infer<typeof roleSchema>;

export function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id && id !== 'new');

  const { data: role, isLoading: isLoadingRole } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getRole(id as string),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      RoleFeature: '',
    },
  });

  // Avoiding useEffect for state sync if possible, but for async defaultValues react-hook-form reset is needed.
  // Using key={id} on a wrapper component is better, but doing a simple reset here is standard for RHF when data loads.
  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description,
        RoleFeature: role.RoleFeature,
      });
    }
  }, [role, reset]);

  const mutation = useMutation({
    mutationFn: (data: RoleForm) => {
      if (isEditing) {
        return roleService.updateRole(id as string, data);
      }
      return roleService.createRole(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/roles');
    },
  });

  const onSubmit = (data: RoleForm) => {
    mutation.mutate(data);
  };

  if (isEditing && isLoadingRole) {
    return <div className="p-8 text-center text-gray-500">Loading role data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit Role' : 'New Role'}
        </h1>
        <Button variant="ghost" onClick={() => navigate('/roles')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="e.g. Administrator"
        />
        
        <Input
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Role description"
        />

        <Input
          label="Role Feature Configuration"
          {...register('RoleFeature')}
          error={errors.RoleFeature?.message}
          placeholder='e.g. { "all": true }'
        />

        <div className="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/roles')}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Role'}
          </Button>
        </div>
      </form>
    </div>
  );
}
