import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Button from '../components/ui/Button';

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reportText, setReportText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = useCallback(() => {
    setLoading(true);
    setError('');
    
    api
      .post(
        `/api/assessments/${id}/report`,
        {},
      )
      .then((res) => setReportText(res.data.reportText))
      .catch(() => setError('报告生成失败，请稍后重试。'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] flex items-center justify-center page-enter">
        <div className="glass-card p-10 text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#f0edff] flex items-center justify-center animate-pulse-glow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5244c2" strokeWidth="1.5">
              <path d="M12 2a7 7 0 017 7c0 2.25-.84 4.1-2.1 5.4L12 22l-4.9-7.6A7 7 0 015 9a7 7 0 017-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1e1b4b] mb-2">正在生成报告</h2>
          <p className="text-sm text-[#6b6893]">AI 正在分析你的测评结果，请稍候...</p>
          <div className="mt-4 w-full h-1.5 bg-[#e0d7fe] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#5244c2] to-[#7a32e0] rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] flex items-center justify-center page-enter">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#fef2f2] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-[#ef4444] mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/history')}>
              返回历史
            </Button>
            <Button variant="primary" onClick={fetchReport}>
              重试
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="glass-card p-5 mb-6">
          <h2 className="text-xl font-bold text-[#1e1b4b]">AI 反馈报告</h2>
          <p className="text-xs text-[#6b6893] mt-1">基于你的测评结果生成的个性化分析</p>
        </div>

        <div className="glass-card p-6">
          <div className="text-[#1e1b4b] text-sm leading-relaxed whitespace-pre-wrap">
            {reportText}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button variant="primary" onClick={() => navigate(`/result/${id}`)}>
            查看得分详情
          </Button>
          <Button variant="outline" onClick={() => navigate('/history')}>
            返回历史
          </Button>
        </div>
      </div>
    </div>
  );
}
