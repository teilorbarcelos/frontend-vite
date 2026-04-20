import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductFilters } from '../components/ProductFilters';
import { PRODUCT_SEARCHABLE_FIELDS } from '../constants/product.constants';
import { getProductColumns } from '../constants/productHeaderMap';
import { productService } from '../services/product.service';

export function ProductListPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [searchWord, setSearchWord] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSearch = useCallback((val: string) => {
    setSearchWord(val);
    setPage(0);
  }, []);

  const { data, isError, isFetching } = useQuery({
    queryKey: ['products', page, size, searchWord, filters],
    queryFn: () => productService.getProducts(page, size, searchWord, PRODUCT_SEARCHABLE_FIELDS.join(','), filters),
    placeholderData: (prev) => prev,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => productService.toggleStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const columns = getProductColumns(
    (id, active) => toggleStatusMutation.mutate({ id, active }),
    (id) => navigate(`/products/update/${id}`),
    (id) => deleteMutation.mutate(id)
  );

  if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar produtos</div>;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
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
          <Button onClick={() => navigate('/products/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <ProductFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilter={(newFilters) => {
          setFilters(newFilters);
          setPage(0);
        }}
        initialValues={filters}
      />

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
