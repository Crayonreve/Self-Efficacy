import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Button from '../components/ui/Button';
import { useChat } from '../contexts/ChatContext';
import RadarChart, { type RadarDataPoint } from '../components/charts/RadarChart';
import TrendChart from '../components/charts/TrendChart';
import TrendAnalysisCard from '../components/TrendAnalysisCard';

interface AssessmentRecord {
  id: string;
  scores: Record<string, number>;
  createdAt: string;
}

export default function TrendView() {
  const navigate = useNavigate();
  const { setOpen } = useChat();
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    api
      .get('/api/assessments?type=FULL_BATTERY')
      .then((res) => setRecords(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe]">
        <div className="w-8 h-8 border-2 border-[#5244c2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] flex items-center justify-center page-enter">
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0edff] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
              <polyline points="3 17 9 11 13 15 21 7" />
            </svg>
          </div>
          <p className="text-[#6b6893]">暂无测评数据，无法生成趋势</p>
        </div>
      </div>
    );
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const lineData = sorted.map((r) => ({
    date: new Date(r.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    自我效能感: +(r.scores?.selfEfficacy ?? 0).toFixed(2),
    适应性总分: +(r.scores?.totalAdapt ?? 0).toFixed(2),
  }));

  const latest = sorted[sorted.length - 1];
  const radarData: RadarDataPoint[] = [
    { name: '自我效能', value: normalize(latest.scores?.selfEfficacy, 1, 4), fullMark: 1, rawValue: latest.scores?.selfEfficacy, rawMax: 4 },
    { name: '学业适应', value: normalize(latest.scores?.academicAdapt, 1, 5), fullMark: 1, rawValue: latest.scores?.academicAdapt, rawMax: 5 },
    { name: '情绪适应', value: normalize(latest.scores?.emotionalAdapt, 1, 5), fullMark: 1, rawValue: latest.scores?.emotionalAdapt, rawMax: 5 },
    { name: 'AI频率', value: normalize(latest.scores?.aiFrequency, 1, 5), fullMark: 1, rawValue: latest.scores?.aiFrequency, rawMax: 5 },
    { name: 'AI多样性', value: normalize(latest.scores?.aiDiversity, 0, 9), fullMark: 1, rawValue: latest.scores?.aiDiversity, rawMax: 9 },
    { name: 'AI感知', value: normalize(latest.scores?.aiPerception, 1, 4), fullMark: 1, rawValue: latest.scores?.aiPerception, rawMax: 4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] page-enter">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 text-sm text-[#6b6893] hover:text-[#5244c2] transition-colors bg-transparent border-0 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            返回
          </button>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">趋势分析</h1>
        </div>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          效能伙伴 AI
        </Button>
      </div>

        {/* Line Chart */}
        <section className="glass-card p-5 mb-6">
          <h2 className="text-lg font-semibold text-[#1e1b4b] mb-1">得分趋势</h2>
          <p className="text-xs text-[#6b6893] mb-4">
            自我效能感 & 适应性总分随时间变化
          </p>
          <TrendChart
            data={lineData}
            lines={[
              { dataKey: '自我效能感', name: '自我效能感', color: '#5244c2' },
              { dataKey: '适应性总分', name: '适应性总分', color: '#7a32e0' },
            ]}
            yDomain={[1, 5]}
          />
        </section>

        {/* Radar Chart */}
        <section className="glass-card p-5">
          <h2 className="text-lg font-semibold text-[#1e1b4b] mb-1">最新测评多维画像</h2>
          <p className="text-xs text-[#6b6893] mb-4">
            {new Date(latest.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <RadarChart data={radarData} />
        </section>

        {/* AI Trend Analysis */}
        <TrendAnalysisCard assessments={records} />
      </div>
    </div>
  );
}

function normalize(score: number | undefined, min: number, max: number): number {
  if (score === undefined || score === null || max === min) return 0;
  return Math.max(0, Math.min(1, (score - min) / (max - min)));
}
