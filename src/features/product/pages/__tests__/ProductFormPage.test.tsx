import { renderWithProviders } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { productService } from '../../services/product.service';
import { ProductFormPage } from '../ProductFormPage';

vi.mock('../../services/product.service', () => ({
  productService: {
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

describe('ProductFormPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as Mock).mockReturnValue({ id: 'new' });
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  it('renders "New Product" title', () => {
    renderWithProviders(<ProductFormPage />);
    expect(screen.getByText('New Product')).toBeInTheDocument();
  });

  it('submits correctly for new product', async () => {
    const user = userEvent.setup();
    (productService.createProduct as Mock).mockResolvedValue({});
    renderWithProviders(<ProductFormPage />);
    
    await user.type(screen.getByLabelText(/Name/i), 'New Product');
    await user.type(screen.getByLabelText(/SKU/i), 'SKU-1');
    await user.type(screen.getByLabelText(/Category/i), 'C1');
    await user.type(screen.getByLabelText(/Price/i), '150');
    await user.type(screen.getByLabelText(/Stock/i), '10');
    await user.type(screen.getByLabelText(/Description/i), 'Desc');
    
    await user.click(screen.getByText('Save Product'));
    
    await waitFor(() => {
      expect(productService.createProduct).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('submits correctly in edit mode', async () => {
    const user = userEvent.setup();
    const mockProduct = { id: '1', name: 'Product A', price: 100, sku: 'S1', category: 'C1', stock: 5, description: 'D1' };
    (useParams as Mock).mockReturnValue({ id: '1' });
    (productService.getProduct as Mock).mockResolvedValue(mockProduct);
    (productService.updateProduct as Mock).mockResolvedValue({});

    renderWithProviders(<ProductFormPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toHaveValue('Product A');
    });
    
    await user.click(screen.getByText('Save Product'));
    await waitFor(() => {
      expect(productService.updateProduct).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductFormPage />);
    
    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    await user.click(cancelButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/products');
    
    await user.click(cancelButtons[1]);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('handles submission error with message', async () => {
    const user = userEvent.setup();
    (productService.createProduct as Mock).mockRejectedValue({
      response: { data: { message: 'API Error Message' } }
    });
    
    renderWithProviders(<ProductFormPage />);
    
    await user.type(screen.getByLabelText(/Name/i), 'New Product');
    await user.type(screen.getByLabelText(/SKU/i), 'SKU-1');
    await user.type(screen.getByLabelText(/Category/i), 'C1');
    await user.type(screen.getByLabelText(/Price/i), '150');
    await user.type(screen.getByLabelText(/Stock/i), '10');
    await user.type(screen.getByLabelText(/Description/i), 'Desc');

    await user.click(screen.getByText('Save Product'));
    
    expect(await screen.findByText(/API Error Message/i)).toBeInTheDocument();
  });

  it('handles submission error without message', async () => {
    const user = userEvent.setup();
    (productService.createProduct as Mock).mockRejectedValue(new Error('Generic Error'));
    
    renderWithProviders(<ProductFormPage />);
    
    await user.type(screen.getByLabelText(/Name/i), 'New Product');
    await user.type(screen.getByLabelText(/SKU/i), 'SKU-1');
    await user.type(screen.getByLabelText(/Category/i), 'C1');
    await user.type(screen.getByLabelText(/Price/i), '150');
    await user.type(screen.getByLabelText(/Stock/i), '10');
    await user.type(screen.getByLabelText(/Description/i), 'Desc');

    await user.click(screen.getByText('Save Product'));
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao salvar produto. Tente novamente.')).toBeInTheDocument();
    });
  });

  it('shows "Saving..." text when mutation is pending', async () => {
    const user = userEvent.setup();
    (productService.createProduct as Mock).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<ProductFormPage />);
    await user.type(screen.getByLabelText(/Name/i), 'New Product');
    await user.type(screen.getByLabelText(/SKU/i), 'SKU-1');
    await user.type(screen.getByLabelText(/Category/i), 'C1');
    await user.type(screen.getByLabelText(/Price/i), '150');
    await user.type(screen.getByLabelText(/Stock/i), '10');
    await user.type(screen.getByLabelText(/Description/i), 'Test Description');
    await user.click(screen.getByText('Save Product'));
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});
