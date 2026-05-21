import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface Props {
  assessments: Array<{
    id: string;
    scores: Record<string, number>;
    createdAt: string;
  }>;
}

interface SavedReport {
  id: string;
  report: string;
  createdAt: string;
}

export default function TrendAnalysisCard({ assessments }: Props) {
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const count = assessments.length;
  const active = history.find((h) => h.id === activeId);

  // Load saved reports on mount
  useEffect(() => {
    api.get('/api/trend-analysis')
      .then((res) => {
        setHistory(res.data);
        if (res.data.length > 0) {
          setActiveId(res.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const sorted = [...assessments].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      const payload = sorted.map((r) => ({
        date: r.createdAt,
        scores: r.scores,
      }));
      const res = await api.post('/api/trend-analysis', { assessments: payload }, { timeout: 60000 });
      if (!res.data.insufficient) {
        const newReport = {
          id: res.data.id,
          report: res.data.report,
          createdAt: res.data.generatedAt,
        };
        setHistory((prev) => [newReport, ...prev]);
        setActiveId(newReport.id);
      }
    } catch {
      setError('AI分析请求超时或失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }

  if (count < 2) {
    return (
      <section className="glass-card p-6 text-center mt-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f0edff] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
            <path d="M12 2a7 7 0 017 7c0 2.25-.84 4.1-2.1 5.4L12 22l-4.9-7.6A7 7 0 015 9a7 7 0 017-7z" />
          </svg>
        </div>
        <p className="text-sm text-[#6b6893]">
          完成 <strong className="text-[#5244c2]">2次以上</strong> 测评后，可生成AI趋势分析报告
        </p>
        <p className="text-xs text-[#a78bfa] mt-1">当前已完成 {count} 次测评</p>
      </section>
    );
  }

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1e1b4b]">AI 趋势分析报告</h2>
          <p className="text-xs text-[#6b6893] mt-0.5">
            基于 {count} 次测评数据的智能趋势解读
            {history.length > 0 && ` · 已生成 ${history.length} 次`}
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="btn bg-gradient-to-r from-[#5244c2] to-[#7a32e0] text-white rounded-xl px-5 py-2.5 text-sm font-semibold border-0 cursor-pointer hover:shadow-[0_0_16px_rgba(82,68,194,0.55)] transition-all disabled:opacity-50"
        >
          {loading ? '生成中...' : '✨ 生成新报告'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card p-10 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#5244c2] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6b6893]">正在分析你的趋势数据...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass-card p-4 text-[#ef4444] text-sm text-center">{error}</div>
      )}

      {/* Empty state (no reports yet, not loading) */}
      {!loading && !error && history.length === 0 && (
        <div className="glass-card p-10 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f0edff] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
              <path d="M12 2a7 7 0 017 7c0 2.25-.84 4.1-2.1 5.4L12 22l-4.9-7.6A7 7 0 015 9a7 7 0 017-7z" />
            </svg>
          </div>
          <p className="text-sm text-[#6b6893]">点击上方按钮生成你的第一份趋势分析报告</p>
        </div>
      )}

      {/* Two-panel layout */}
      {!loading && !error && history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Report viewer */}
          <div className="lg:col-span-8 glass-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#1e1b4b]">📄 报告内容</h3>
              {active && (
                <span className="text-xs text-[#a78bfa]">
                  {new Date(active.createdAt).toLocaleString('zh-CN')}
                </span>
              )}
            </div>
            <div className="flex-1 bg-[#fafafa] rounded-xl p-5 text-sm text-[#1e1b4b] leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[500px]">
              {active ? active.report : '请从右侧选择一份报告查看'}
            </div>
          </div>

          {/* Right: History panel */}
          <div className="lg:col-span-4 glass-card p-5 flex flex-col">
            <h3 className="text-sm font-semibold text-[#1e1b4b] mb-3">📋 历史记录</h3>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px]">
              {history.map((h) => {
                const isActive = h.id === activeId;
                return (
                  <button
                    key={h.id}
                    onClick={() => setActiveId(h.id)}
                    className={`w-full text-left p-3 rounded-lg border-0 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-[#f0edff] border-l-[3px] border-l-[#5244c2] shadow-sm'
                        : 'bg-[#f8f7ff] hover:bg-[#f0edff]'
                    }`}
                  >
                    <p className="text-xs text-[#a78bfa]">
                      {new Date(h.createdAt).toLocaleString('zh-CN', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-[#1e1b4b] mt-1 line-clamp-2 leading-relaxed">
                      {h.report.slice(0, 80)}{h.report.length > 80 ? '...' : ''}
                    </p>
                    {isActive && (
                      <span className="inline-block mt-1.5 text-xs text-[#5244c2] bg-[#e0d7fe] px-2 py-0.5 rounded-full">
                        查看中
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
