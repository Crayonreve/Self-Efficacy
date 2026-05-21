import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface RadarDataPoint {
  name: string;
  value: number;        // normalized 0-1
  fullMark: number;     // always 1
  rawValue?: number;    // original score before normalization
  rawMax?: number;      // original max
}

interface Props {
  data: RadarDataPoint[];
  emptyMessage?: string;
}

function getRating(v: number): string {
  if (v >= 0.90) return 'S';
  if (v >= 0.75) return 'A+';
  if (v >= 0.60) return 'A';
  if (v >= 0.45) return 'B';
  if (v >= 0.30) return 'C';
  return 'D';
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: RadarDataPoint }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  const rating = getRating(d.value);
  return (
    <div
      className="glass-card px-4 py-3 text-sm"
      style={{ minWidth: 170 }}
    >
      <p className="font-semibold text-[#1e1b4b] mb-1">{d.name}</p>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#6b6893] text-xs">评级</span>
        <span className="text-sm font-bold text-[#7a32e0] bg-[#7a32e0]/10 px-1.5 py-0.5 rounded">
          {rating}
        </span>
      </div>
      {d.rawValue != null && d.rawMax != null && (
        <p className="text-xs text-[#6b6893]">
          原始分 {typeof d.rawValue === 'number' ? d.rawValue.toFixed(2) : d.rawValue}
          <span className="text-[#a78bfa]">/{d.rawMax}</span>
        </p>
      )}
      <p className="text-xs text-[#a78bfa] mt-0.5">
        归一化 {d.value.toFixed(2)} / 1.00
      </p>
    </div>
  );
}

export default function RadarChart({ data, emptyMessage }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[340px] text-[#6b6893] text-sm">
        <div className="text-center">
          <svg
            className="mx-auto mb-3"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c4b5f9"
            strokeWidth="1.5"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <p>{emptyMessage ?? '暂无数据'}</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={380}>
      <ReRadarChart
        data={data}
        cx="50%"
        cy="50%"
        outerRadius="68%"
        margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
      >
        <PolarGrid stroke="#e0d7fe" strokeWidth={0.8} />
        <PolarAngleAxis
          dataKey="name"
          tick={(tickProps: any) => {
            // Recharts tick payload: { value: string, coordinate: number, index: number }
            const idx = tickProps?.payload?.index ?? tickProps?.index ?? -1;
            const d: RadarDataPoint | undefined = idx >= 0 ? data[idx] : undefined;
            const labelName = d?.name ?? tickProps?.payload?.value ?? '';
            const rating = d ? getRating(d.value) : '?';
            const rawStr = d?.rawValue != null
              ? (typeof d.rawValue === 'number' ? d.rawValue.toFixed(2) : String(d.rawValue))
              : '';
            return (
              <g>
                <text
                  x={tickProps.x}
                  y={tickProps.y}
                  textAnchor={tickProps.x > tickProps.cx ? 'start' : tickProps.x < tickProps.cx ? 'end' : 'middle'}
                  fill="#1e1b4b"
                  fontSize={13}
                  fontWeight={500}
                  dominantBaseline="central"
                  dy={-4}
                >
                  {labelName}
                </text>
                <text
                  x={tickProps.x}
                  y={tickProps.y}
                  textAnchor={tickProps.x > tickProps.cx ? 'start' : tickProps.x < tickProps.cx ? 'end' : 'middle'}
                  fill="#7a32e0"
                  fontSize={11}
                  fontWeight={600}
                  dominantBaseline="central"
                  dy={14}
                >
                  {rating}{rawStr ? ` | ${rawStr}` : ''}
                </text>
              </g>
            );
          }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 1]}
          tick={{ fill: '#a78bfa', fontSize: 10 }}
          stroke="transparent"
          axisLine={false}
          tickCount={5}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          dataKey="value"
          stroke="#7a32e0"
          strokeWidth={2}
          fill="#7a32e0"
          fillOpacity={0.25}
          dot={{ r: 4, fill: '#7a32e0', fillOpacity: 0.9, stroke: '#fff', strokeWidth: 2 }}
          activeDot={{ r: 6, stroke: '#5244c2', strokeWidth: 2, fill: '#fff' }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
