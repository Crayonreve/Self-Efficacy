import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import SEQuestionnaire from './SEQuestionnaire';
import CUASQuestionnaire from './CUASQuestionnaire';
import AIUsageQuestionnaire, { type AIUsageData } from './AIUsageQuestionnaire';

const STEPS = ['自我效能感', '大学生适应', 'AI使用'];

export default function AssessmentWizard() {
  const [step, setStep] = useState(0);
  const [seAnswers, setSeAnswers] = useState<number[] | null>(null);
  const [cuasAnswers, setCuasAnswers] = useState<number[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const navigate = useNavigate();

  const hasStarted = step > 0 || seAnswers !== null || cuasAnswers !== null;

  function handleBackClick() {
    if (hasStarted) {
      setShowExitConfirm(true);
    } else {
      navigate('/');
    }
  }

  function confirmExit() {
    setShowExitConfirm(false);
    navigate('/');
  }

  async function handleFinalSubmit(ai: AIUsageData) {
    setSubmitting(true);
    setError('');

    try {
      
      const res = await api.post(
        '/api/assessments',
        {
          type: 'FULL_BATTERY',
          responses: {
            seResponses: seAnswers,
            cuasResponses: cuasAnswers,
            aiData: ai,
          },
        },
      );
      navigate(`/result/${res.data.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || '提交失败，请稍后重试';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] page-enter">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1e1b4b]">效能测评</h1>
          <p className="text-sm text-[#6b6893] mt-1">完成三个量表，获取你的多维画像</p>
          <button
            onClick={handleBackClick}
            className="mt-3 inline-flex items-center gap-1 text-sm text-[#6b6893] hover:text-[#5244c2] transition-colors bg-transparent border-0 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            返回首页
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center items-center mb-8">
          {STEPS.map((label, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      active
                        ? 'step-active bg-gradient-to-r from-[#5244c2] to-[#7a32e0] text-white shadow-[0_0_12px_rgba(82,68,194,0.5)]'
                        : done
                          ? 'bg-[#10b981] text-white'
                          : 'bg-[#e0d7fe] text-[#a78bfa]'
                    }`}
                  >
                    {done ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="5 13 10 18 19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                      active ? 'text-[#5244c2]' : done ? 'text-[#10b981]' : 'text-[#a78bfa]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                      done ? 'bg-[#10b981]' : 'bg-[#e0d7fe]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="glass-card p-6 slide-in-card" key={step}>
          {step === 0 && (
            <SEQuestionnaire
              initialAnswers={seAnswers ?? undefined}
              onComplete={(a) => { setSeAnswers(a); setStep(1); }}
            />
          )}
          {step === 1 && (
            <CUASQuestionnaire
              initialAnswers={cuasAnswers ?? undefined}
              onComplete={(a) => { setCuasAnswers(a); setStep(2); }}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <AIUsageQuestionnaire
              onComplete={handleFinalSubmit}
              onBack={() => setStep(1)}
            />
          )}
        </div>

        {/* Submit state */}
        {submitting && (
          <div className="mt-4 text-center flex items-center justify-center gap-2 text-[#6b6893]">
            <div className="w-5 h-5 border-2 border-[#5244c2] border-t-transparent rounded-full animate-spin" />
            提交中...
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[#ef4444] text-sm text-center">
            {error}
          </div>
        )}

        {/* Exit confirmation modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="glass-card p-6 max-w-sm mx-4 text-center animate-scale-in">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#fef3c7] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#1e1b4b] mb-2">确认离开？</h3>
              <p className="text-sm text-[#6b6893] mb-6">
                你尚未完成测评，已填写的内容将不会保存。确认返回首页吗？
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="px-5 py-2 rounded-xl border-2 border-[#e0d7fe] text-[#6b6893] text-sm font-semibold bg-transparent cursor-pointer hover:bg-[#f8f7ff] transition-colors"
                >
                  继续测评
                </button>
                <button
                  onClick={confirmExit}
                  className="px-5 py-2 rounded-xl bg-[#ef4444] text-white text-sm font-semibold border-0 cursor-pointer hover:bg-[#dc2626] transition-colors"
                >
                  确认返回
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
