import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { roleService } from '@/features/role/services/role.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().optional(),
  id_role: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
  document: z.string().optional(),
});

type UserForm = z.infer<typeof userSchema>;

export function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id && id !== 'new');

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id as string),
    enabled: isEditing,
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles', 0, 100], // Fetch all active roles essentially
    queryFn: () => roleService.getRoles(0, 100),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      id_role: '',
      phone: '',
      document: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        id_role: user.id_role,
        phone: user.phone || '',
        document: user.document || '',
        password: '', // do not fill password
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: UserForm) => {
      // Remove empty password if not changing
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }

      if (isEditing) {
        return userService.updateUser(id as string, payload);
      }
      // Password is required for create, schema doesn't enforce it if optional above, let's just pass it
      return userService.createUser(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
  });

  const onSubmit = (data: UserForm) => {
    if (!isEditing && !data.password) {
      alert('Password is required for new users');
      return;
    }
    mutation.mutate(data);
  };

  if (isEditing && isLoadingUser) {
    return <div className="p-8 text-center text-gray-500">Loading user data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit User' : 'New User'}
        </h1>
        <Button variant="ghost" onClick={() => navigate('/users')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Full Name"
        />
        
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="user@example.com"
        />

        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder={isEditing ? 'Leave blank to keep unchanged' : 'Password'}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            {...register('id_role')}
            className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.id_role ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select a role</option>
            {rolesData?.items?.map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.id_role && <p className="text-sm text-red-500">{errors.id_role.message}</p>}
        </div>

        <Input
          label="Phone"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="+55 11 99999-9999"
        />

        <Input
          label="Document (CPF/CNPJ)"
          {...register('document')}
          error={errors.document?.message}
          placeholder="000.000.000-00"
        />

        <div className="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save User'}
          </Button>
        </div>
      </form>
    </div>
  );
}
