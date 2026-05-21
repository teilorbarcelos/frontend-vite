import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { TimeSeriesStat } from '../services/dashboard.service';

interface UserCreationsChartProps {
  data: TimeSeriesStat[];
}

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export function UserCreationsChart({ data }: UserCreationsChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: formatDateLabel(item.date)
  }));

  return (
    <div className="col-span-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold text-gray-900 leading-none tracking-tight">Criação de Usuários</h3>
        <p className="text-sm text-gray-500">Evolução diária de registros no período.</p>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} stroke="#6b7280" />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
              />
              <Area type="monotone" dataKey="count" name="Quant." stroke="#4f46e5" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
