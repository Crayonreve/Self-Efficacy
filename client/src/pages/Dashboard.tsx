import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import RadarChart, { type RadarDataPoint } from '../components/charts/RadarChart';
import Button from '../components/ui/Button';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import StarBackground from '../components/StarBackground';
import HelpPanel from '../components/HelpPanel';

interface AssessmentRecord {
  id: string;
  scores: Record<string, number>;
  createdAt: string;
}

interface UserInfo {
  name?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { setOpen } = useChat();
  const { logout } = useAuth();
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [user, setUser] = useState<UserInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    Promise.all([
      api.get('/api/assessments?type=FULL_BATTERY&limit=10'),
      api.get('/api/user/profile').catch(() => ({ data: {} })),
    ])
      .then(([assessRes, userRes]) => {
        setRecords(assessRes.data);
        setUser(userRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = records.length > 0 ? records[0] : null;
  const scores = latest?.scores;

  const radarData: RadarDataPoint[] = latest
    ? [
        { name: '自我效能', value: normalize(scores?.selfEfficacy, 1, 4), fullMark: 1, rawValue: scores?.selfEfficacy, rawMax: 4 },
        { name: '学业适应', value: normalize(scores?.academicAdapt, 1, 5), fullMark: 1, rawValue: scores?.academicAdapt, rawMax: 5 },
        { name: '情绪适应', value: normalize(scores?.emotionalAdapt, 1, 5), fullMark: 1, rawValue: scores?.emotionalAdapt, rawMax: 5 },
        { name: 'AI频率', value: normalize(scores?.aiFrequency, 1, 5), fullMark: 1, rawValue: scores?.aiFrequency, rawMax: 5 },
        { name: 'AI多样性', value: normalize(scores?.aiDiversity, 0, 9), fullMark: 1, rawValue: scores?.aiDiversity, rawMax: 9 },
        { name: 'AI感知', value: normalize(scores?.aiPerception, 1, 4), fullMark: 1, rawValue: scores?.aiPerception, rawMax: 4 },
      ]
    : [];

  const aiRiskLevel = getAiRiskLevel(
    scores?.aiPerception ??
    /* perception items 4 & 6 map to indices 3 & 5 */ undefined,
  );

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()];
  const greeting = getGreeting(today.getHours());
  const nickname = user?.name ?? '同学';

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
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] page-enter relative">
      <StarBackground />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 relative z-[1]">
        {/* ===== Welcome Banner ===== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5244c2] via-[#7a32e0] to-[#4120b9] text-white p-6 md:p-8 mb-6 shadow-xl">
          {/* Logout button */}
          <button
            onClick={logout}
            className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium border border-white/20 cursor-pointer transition-all backdrop-blur-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            退出登录
          </button>
          <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-10">
            <svg viewBox="0 0 100 100" fill="white">
              <circle cx="30" cy="30" r="25" />
              <circle cx="70" cy="50" r="20" />
              <circle cx="50" cy="80" r="15" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-sm md:text-base opacity-80 mb-1">
              {dateStr} 星期{weekday}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting}，{nickname} ✨
            </h1>
            <p className="mt-2 text-sm md:text-base opacity-90 max-w-lg">
              每一次测评都是自我认知的进阶。查看你的多维画像，了解适应能力与AI使用模式。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ===== Left: Radar Chart ===== */}
          <div className="lg:col-span-1 glass-card p-5 order-2 lg:order-1">
            <h2 className="text-lg font-semibold text-[#1e1b4b] mb-1">多维画像</h2>
            <p className="text-xs text-[#6b6893] mb-3">
              {latest
                ? `最近测评 — ${new Date(latest.createdAt).toLocaleDateString('zh-CN')}`
                : ''}
            </p>
            {latest ? (
              <RadarChart
                data={radarData}
                emptyMessage="完成首次测评，解锁您的多维画像"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-[#f0edff] flex items-center justify-center mb-4">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <p className="text-[#6b6893] text-sm max-w-[200px]">
                  完成首次测评，解锁您的多维画像
                </p>
                <Button
                  variant="primary"
                  className="mt-4 text-sm"
                  onClick={() => navigate('/assess')}
                >
                  开始测评
                </Button>
              </div>
            )}
          </div>

          {/* ===== Right: Metric Cards ===== */}
          <div className="lg:col-span-2 flex flex-col gap-4 order-1 lg:order-2">
            {/* Self-Efficacy */}
            <div className="glass-card p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
              <SemiCircleGauge
                value={scores?.selfEfficacy ?? 0}
                max={4}
                color="#5244c2"
                label=""
              />
              <div className="flex-1">
                <p className="text-xs text-[#6b6893] uppercase tracking-wide font-medium">
                  自我效能感
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <CountUp target={+(scores?.selfEfficacy ?? 0).toFixed(2)} />
                  <span className="text-sm text-[#6b6893]">/ 4.00</span>
                </div>
                <p className="text-xs text-[#6b6893] mt-2">
                  {scores?.selfEfficacy
                    ? `你对自己达成目标的信念${
                        scores.selfEfficacy >= 3
                          ? '较强，积极应对挑战'
                          : scores.selfEfficacy >= 2
                            ? '处于平均水平'
                            : '有待提升'
                      }`
                    : '完成自我效能感测评后显示'}
                </p>
              </div>
            </div>

            {/* Adaptability Total */}
            <div className="glass-card p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
              <SemiCircleGauge
                value={scores?.totalAdapt ?? 0}
                max={5}
                color="#4120b9"
                label=""
              />
              <div className="flex-1">
                <p className="text-xs text-[#6b6893] uppercase tracking-wide font-medium">
                  适应性总分
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <CountUp target={+(scores?.totalAdapt ?? 0).toFixed(2)} />
                  <span className="text-sm text-[#6b6893]">/ 5.00</span>
                </div>
                <p className="text-xs text-[#6b6893] mt-2">
                  {scores?.totalAdapt
                    ? `大学适应能力${
                        scores.totalAdapt >= 4
                          ? '良好，在各个维度表现均衡'
                          : scores.totalAdapt >= 3
                            ? '中等，有进一步提升空间'
                            : '需要关注，建议寻求支持'
                      }`
                    : '完成适应量表后显示'}
                </p>
              </div>
            </div>

            {/* AI Dependency Risk */}
            <div className="glass-card p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
                style={{
                  background:
                    aiRiskLevel.level === '低'
                      ? 'rgba(16,185,129,0.12)'
                      : aiRiskLevel.level === '中'
                        ? 'rgba(245,158,11,0.12)'
                        : 'rgba(239,68,68,0.12)',
                  color:
                    aiRiskLevel.level === '低'
                      ? '#10b981'
                      : aiRiskLevel.level === '中'
                        ? '#f59e0b'
                        : '#ef4444',
                }}
              >
                {aiRiskLevel.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#6b6893] uppercase tracking-wide font-medium">
                  AI依赖风险
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xl font-bold"
                    style={{
                      color:
                        aiRiskLevel.level === '低'
                          ? '#10b981'
                          : aiRiskLevel.level === '中'
                            ? '#f59e0b'
                            : '#ef4444',
                    }}
                  >
                    {aiRiskLevel.level}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0edff] text-[#5244c2]">
                    风险
                  </span>
                </div>
                <p className="text-xs text-[#6b6893] mt-2">{aiRiskLevel.desc}</p>
              </div>
            </div>

            {/* Help entry card */}
            <HelpPanel />
          </div>
        </div>

        {/* ===== Quick Actions ===== */}
        <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
          <Button
            variant="primary"
            className="px-8 py-3 text-base"
            onClick={() => navigate('/assess')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            开始新测评
          </Button>
          <Button
            variant="outline"
            className="px-8 py-3 text-base"
            onClick={() => navigate('/history')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            测评历史
          </Button>
          <Button
            variant="outline"
            className="px-8 py-3 text-base"
            onClick={() => navigate('/trend')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 17 9 11 13 15 21 7" />
              <polyline points="17 7 21 7 21 11" />
            </svg>
            趋势分析
          </Button>
          <Button
            variant="ghost"
            className="px-8 py-3 text-base"
            onClick={() => setOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            效能伙伴 AI
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function normalize(score: number | undefined, min: number, max: number): number {
  if (score === undefined || score === null || max === min) return 0;
  return Math.max(0, Math.min(1, (score - min) / (max - min)));
}

function getGreeting(hour: number): string {
  if (hour < 6) return '夜深了';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function getAiRiskLevel(aiPerceptionMean?: number): {
  level: string;
  icon: string;
  desc: string;
} {
  if (aiPerceptionMean === undefined || aiPerceptionMean === null) {
    return { level: '--', icon: '?', desc: '完成AI影响感知测评后显示' };
  }
  // Items 4 & 6 measure dependency on AI
  if (aiPerceptionMean > 3) {
    return {
      level: '高',
      icon: '!',
      desc: '对AI工具依赖度较高，建议培养独立解决问题的能力',
    };
  }
  if (aiPerceptionMean > 2) {
    return {
      level: '中',
      icon: '~',
      desc: '存在一定AI依赖倾向，注意平衡使用与独立思考',
    };
  }
  return { level: '低', icon: '✓', desc: 'AI依赖风险较低，保持了良好的独立性' };
}

/* ── Semi-circle Gauge ── */

function SemiCircleGauge({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
}) {
  const radius = 32;
  const stroke = 5;
  const circumference = Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const dashLen = circumference * pct;

  return (
    <div className="relative flex-shrink-0" style={{ width: 76, height: 44 }}>
      <svg width="76" height="44" viewBox="0 0 76 44">
        {/* Background arc */}
        <path
          d={`M ${stroke} 38 A ${radius} ${radius} 0 0 1 ${76 - stroke} 38`}
          fill="none"
          stroke="#e0d7fe"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${stroke} 38 A ${radius} ${radius} 0 0 1 ${76 - stroke} 38`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dashLen} ${circumference}`}
          className="gauge-ring"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-bold"
        style={{ color }}
      >
        {value.toFixed(1)}
      </div>
    </div>
  );
}

/* ── CountUp component ── */

function CountUp({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - (1 - progress) ** 3;
      setCurrent(+(target * eased).toFixed(2));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <span className="text-2xl font-bold count-up">{current.toFixed(2)}</span>;
}
