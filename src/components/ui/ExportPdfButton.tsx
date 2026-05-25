import { downloadPdf } from '@/utils/download';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';

interface ExportPdfParams {
  searchWord?: string;
  searchFields?: string[];
  filters?: Record<string, unknown>;
  sort?: { orderBy?: string; orderDirection?: string };
}

interface ExportPdfButtonProps {
  onExport: (params: ExportPdfParams) => Promise<Blob>;
  queryParams: ExportPdfParams;
  filename?: string;
  label?: string;
}

export function ExportPdfButton({
  onExport,
  queryParams,
  filename = 'relatorio.pdf',
  label = 'Exportar PDF',
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await onExport(queryParams);
      downloadPdf(blob, filename);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="secondary" 
      onClick={handleExport}
      isLoading={isExporting}
    >
      <FileText className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
