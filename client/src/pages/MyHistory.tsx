import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Button from '../components/ui/Button';

interface AssessmentRecord {
  id: string;
  type: string;
  scores: Record<string, number>;
  createdAt: string;
}

export default function MyHistory() {
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#5244c2] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#6b6893] text-sm">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] page-enter">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 text-sm text-[#6b6893] hover:text-[#5244c2] transition-colors bg-transparent border-0 cursor-pointer mb-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              返回首页
            </button>
            <h1 className="text-2xl font-bold text-[#1e1b4b]">测评历史</h1>
            <p className="text-sm text-[#6b6893] mt-1">回顾你的成长轨迹</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/assess')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            新测评
          </Button>
        </div>

        {records.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0edff] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <p className="text-[#6b6893] mb-4">暂无测评记录</p>
            <Button variant="primary" onClick={() => navigate('/assess')}>
              开始首次测评
            </Button>
          </div>
        ) : (
          <div className="timeline-line space-y-4">
            {records.map((r) => {
              const expanded = expandedId === r.id;
              const scores = r.scores;
              return (
                <div key={r.id} className="relative">
                  <div className="timeline-dot" />
                  <div
                    className="glass-card p-5 cursor-pointer"
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#1e1b4b]">
                          {new Date(r.createdAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </p>
                        <p className="text-xs text-[#6b6893] mt-0.5">
                          自我效能 {scores?.selfEfficacy?.toFixed(2) ?? '--'}
                          {' · '}
                          适应性总分 {scores?.totalAdapt?.toFixed(2) ?? '--'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                            expanded
                              ? 'bg-[#5244c2] text-white'
                              : 'bg-[#f0edff] text-[#5244c2]'
                          }`}
                        >
                          {expanded ? '收起' : '展开'}
                        </span>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {expanded && (
                      <div className="mt-4 pt-4 border-t border-[#e0d7fe] grid grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in">
                        <MiniCard label="自我效能感" value={scores?.selfEfficacy?.toFixed(2)} max="4.00" />
                        <MiniCard label="适应性总分" value={scores?.totalAdapt?.toFixed(2)} max="5.00" />
                        <MiniCard label="学业适应" value={scores?.academicAdapt?.toFixed(2)} max="5.00" />
                        <MiniCard label="情绪适应" value={scores?.emotionalAdapt?.toFixed(2)} max="5.00" />
                        <MiniCard label="AI频率" value={scores?.aiFrequency} max="5" />
                        <MiniCard label="AI多样性" value={scores?.aiDiversity} max="9" />
                        <MiniCard label="AI影响感知" value={scores?.aiPerception?.toFixed(2)} max="4.00" />
                        <div className="col-span-full flex gap-2 mt-2">
                          <Button
                            variant="primary"
                            className="text-xs py-1.5 px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/report/${r.id}`);
                            }}
                          >
                            查看报告
                          </Button>
                          <Button
                            variant="outline"
                            className="text-xs py-1.5 px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/result/${r.id}`);
                            }}
                          >
                            查看详情
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {records.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate('/trend')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 17 9 11 13 15 21 7" />
                <polyline points="17 7 21 7 21 11" />
              </svg>
              查看趋势图
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({
  label,
  value,
  max,
}: {
  label: string;
  value: string | number | undefined;
  max: string;
}) {
  return (
    <div className="bg-[#f8f7ff] rounded-lg p-3">
      <p className="text-xs text-[#6b6893]">{label}</p>
      <p className="text-base font-bold text-[#1e1b4b] mt-0.5">
        {value ?? '--'}
        <span className="text-xs font-normal text-[#a78bfa]"> / {max}</span>
      </p>
    </div>
  );
}
