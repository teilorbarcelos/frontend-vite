import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { roleMutations } from '../hooks/role.mutations';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { roleService, type RoleFeature } from '../services/role.service';

const roleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  permissions: z.array(z.object({
    id_feature: z.string(),
    create: z.boolean(),
    view: z.boolean(),
    delete: z.boolean(),
    activate: z.boolean(),
  })),
});

type RoleForm = z.infer<typeof roleSchema>;

export function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const { data: features, isLoading: isLoadingFeatures } = useQuery({
    queryKey: ['features'],
    queryFn: () => roleService.getFeatures(),
  });

  const { data: role, isLoading: isLoadingRole } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getRole(id as string),
    enabled: isEditing,
  });

  const initialValues = useMemo(() => {
    if (!features) return undefined;
    
    return {
      name: role?.name || '',
      description: role?.description || '',
      permissions: features.map(feature => {
        const existing = role?.RoleFeature?.find((rf: RoleFeature) => rf.id_feature === feature.id);
        return {
          id_feature: feature.id,
          create: existing?.create ?? false,
          view: existing?.view ?? false,
          delete: existing?.delete ?? false,
          activate: existing?.activate ?? false,
        };
      })
    };
  }, [features, role]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    values: initialValues,
  });

  const { fields } = useFieldArray({
    control,
    name: 'permissions',
  });

  const mutation = roleMutations.useSave<RoleForm>(isEditing, id, {
    onSuccess: () => navigate('/roles')
  });

  const onSubmit = (data: RoleForm) => {
    mutation.mutate(data);
  };

  if ((isEditing && isLoadingRole) || isLoadingFeatures) {
    return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;
  }

  return (
    <div className="overflow-y-auto flex-1 pb-8">
      <div className="max-w-4xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Perfil' : 'Novo Perfil'}
          </h1>
          <Button variant="ghost" onClick={() => navigate('/roles')}>
            Cancelar
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Perfil"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Ex: Administrador"
            />
            
            <Input
              label="Descrição"
              {...register('description')}
              error={errors.description?.message}
              placeholder="Descrição das responsabilidades"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Matriz de Permissões</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ver</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Criar/Editar</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Deletar</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ativar/Inativar</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((field, index) => {
                    const feature = features?.find(f => f.id === field.id_feature);
                    return (
                      <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{feature?.name}</div>
                          <div className="text-xs text-gray-500">{feature?.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.view`)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.create`)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.delete`)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.activate`)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/roles')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
