import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Button from '../components/ui/Button';

interface AssessmentDetail {
  id: string;
  type: string;
  scores: Record<string, number>;
  responses: unknown;
  createdAt: string;
  warnings?: string[];
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    api
      .get(`/api/assessments/${id}`)
      .then((res) => setRecord(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe]">
        <div className="w-8 h-8 border-2 border-[#5244c2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] flex items-center justify-center page-enter">
        <div className="glass-card p-8 text-center">
          <p className="text-[#ef4444] mb-4">测评记录未找到</p>
          <Button variant="outline" onClick={() => navigate('/history')}>
            返回历史
          </Button>
        </div>
      </div>
    );
  }

  const s = record.scores;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] page-enter">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/history')}
          className="inline-flex items-center gap-1 text-sm text-[#6b6893] hover:text-[#5244c2] transition-colors bg-transparent border-0 cursor-pointer mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回历史
        </button>
        {/* Success banner */}
        <div className="glass-card p-6 mb-6 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#10b981]/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
              <polyline points="5 13 10 18 19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1e1b4b]">测评提交成功</h2>
          <p className="text-sm text-[#6b6893] mt-1">
            {new Date(record.createdAt).toLocaleString('zh-CN')}
          </p>
        </div>

        {/* Score details */}
        <section className="glass-card p-5">
          <h3 className="text-lg font-semibold text-[#1e1b4b] mb-4">得分概览</h3>
          <div className="space-y-2">
            {s.selfEfficacy != null && (
              <ScoreRow label="自我效能感" value={s.selfEfficacy.toFixed(2)} max="4.00" />
            )}
            {s.totalAdapt != null && (
              <ScoreRow label="适应性总分" value={s.totalAdapt.toFixed(2)} max="5.00" />
            )}
            {s.academicAdapt != null && (
              <ScoreRow label="学业适应" value={s.academicAdapt.toFixed(2)} max="5.00" />
            )}
            {s.emotionalAdapt != null && (
              <ScoreRow label="情绪适应" value={s.emotionalAdapt.toFixed(2)} max="5.00" />
            )}
            {s.aiFrequency != null && (
              <ScoreRow label="AI使用频率" value={String(s.aiFrequency)} max="5" />
            )}
            {s.aiDiversity != null && (
              <ScoreRow label="AI使用多样性" value={String(s.aiDiversity)} max="9" />
            )}
            {s.aiPerception != null && (
              <ScoreRow label="AI影响感知" value={s.aiPerception.toFixed(2)} max="4.00" />
            )}
          </div>
        </section>

        {/* Warnings */}
        {record.warnings && record.warnings.length > 0 && (
          <div className="mt-4 p-4 bg-[#fffbeb] border border-[#fde68a] rounded-xl">
            <strong className="text-sm text-[#92400e]">提示</strong>
            <ul className="mt-1 ml-4 list-disc text-sm text-[#a16207]">
              {record.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button variant="primary" onClick={() => navigate(`/report/${record.id}`)}>
            生成AI反馈报告
          </Button>
          <Button variant="outline" onClick={() => navigate('/history')}>
            查看历史记录
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, value, max }: { label: string; value: string; max: string }) {
  const pct = Math.min(parseFloat(value) / parseFloat(max), 1) * 100;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-[#1e1b4b] w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#e0d7fe] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#5244c2] to-[#7a32e0] rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-[#1e1b4b] w-20 text-right">
        {value} <span className="text-[#a78bfa] text-xs font-normal">/ {max}</span>
      </span>
    </div>
  );
}
