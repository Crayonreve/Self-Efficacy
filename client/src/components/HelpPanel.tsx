import { useNavigate } from 'react-router-dom';

export default function HelpPanel() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/help')}
      className="w-full text-left glass-card p-5 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 border-0"
    >
      <div className="w-12 h-12 rounded-xl bg-[#f0edff] flex items-center justify-center flex-shrink-0 text-2xl">
        📖
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1e1b4b]">帮助中心</p>
        <p className="text-xs text-[#6b6893] mt-0.5">
          了解自我效能感概念、测评工具使用指南与常见问题
        </p>
      </div>
      <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="#a78bfa" strokeWidth="2"
        className="flex-shrink-0"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
