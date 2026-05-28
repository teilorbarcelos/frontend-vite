import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import type { UserProductStat } from '../services/dashboard.service';

interface TopCreatorsChartProps {
  data: UserProductStat[];
}

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

export function TopCreatorsChart({ data }: TopCreatorsChartProps) {
  const userNamesMap = new Map(data.map(u => [u.userId, u.userName]));

  return (
    <div className="col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold text-gray-900 leading-none tracking-tight">Top Criadores (Produtos)</h3>
        <p className="text-sm text-gray-500">Usuários que mais cadastraram produtos.</p>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
              <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} stroke="#6b7280" />
              <YAxis 
                dataKey="userId" 
                type="category" 
                width={100} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                stroke="#6b7280"
                tickFormatter={(id) => userNamesMap.get(id) || id}
              />
              <RechartsTooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                labelFormatter={(label) => userNamesMap.get(label) || label}
              />
              <Bar dataKey="count" name="Quant." fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={16}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.userId}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
