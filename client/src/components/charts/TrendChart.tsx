import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

interface LineDef {
  dataKey: string;
  name: string;
  color: string;
}

interface Props {
  data: Record<string, unknown>[];
  lines: LineDef[];
  height?: number;
  yDomain?: [number, number];
}

export default function TrendChart({
  data,
  lines,
  height = 320,
  yDomain,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-[#6b6893] text-sm" style={{ height }}>
        暂无趋势数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {lines.map((line) => (
            <linearGradient
              key={`grad-${line.dataKey}`}
              id={`fill-${line.dataKey}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={line.color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0d7fe" strokeWidth={0.5} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b6893', fontSize: 12 }}
          stroke="#e0d7fe"
          strokeWidth={0.5}
        />
        <YAxis
          domain={yDomain ?? ['auto', 'auto']}
          tick={{ fill: '#6b6893', fontSize: 12 }}
          stroke="transparent"
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #e0d7fe',
            borderRadius: '0.625rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
            fontSize: '13px',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '13px', color: '#1e1b4b' }}
        />
        {lines.map((line) => (
          <Area
            key={`area-${line.dataKey}`}
            type="monotone"
            dataKey={line.dataKey}
            stroke="none"
            fill={`url(#fill-${line.dataKey})`}
          />
        ))}
        {lines.map((line) => (
          <Line
            key={`line-${line.dataKey}`}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#fff', stroke: line.color, strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: line.color, strokeWidth: 2, fill: '#fff' }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
