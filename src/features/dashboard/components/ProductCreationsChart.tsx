import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { TimeSeriesStat } from '../services/dashboard.service';

interface ProductCreationsChartProps {
  data: TimeSeriesStat[];
}

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export function ProductCreationsChart({ data }: ProductCreationsChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: formatDateLabel(item.date)
  }));

  return (
    <div className="col-span-full rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold text-gray-900 leading-none tracking-tight">Criação de Produtos</h3>
        <p className="text-sm text-gray-500">Volume de produtos cadastrados por dia.</p>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                angle={-45} 
                textAnchor="end" 
                height={55}
                stroke="#6b7280"
              />
              <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#6b7280" />
              <RechartsTooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
              />
              <Bar dataKey="count" name="Quant." fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
