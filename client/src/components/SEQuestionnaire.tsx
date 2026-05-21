import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import Button from './ui/Button';

const QUESTIONS = [
  '在学习、社交或生活中，如果我尽力去做的话，我总是能够解决问题或困难。',
  '即使他人反对我，我也有办法实现自己的目标。',
  '在大学生活中，我认为自己有能力坚持自己的理想并达成设定的阶段性目标。',
  '面对大学各种突如其来的事情，我相信自己能够妥善应对。',
  '凭借现有的知识储备和应变能力，我有信心处理校园生活中的意外情况。',
  '如果我付出足够努力，我能够克服大部分学业及生活上的困难。',
  '遇到困难时，我能保持冷静并找到合适的解决途径。',
  '当面临决策、选择、管理等难题时，我通常能想出多个可行方案。',
  '当遇到学业、社交、生活上的麻烦时，我总能找到缓解问题的方法。',
  '大学中无论什么事在我身上发生，我都能应付自如。',
];

const OPTIONS = [
  { value: 1, label: '完全不正确' },
  { value: 2, label: '有点不正确' },
  { value: 3, label: '多数正确' },
  { value: 4, label: '完全正确' },
];

interface Props {
  onComplete: (answers: number[]) => void;
  initialAnswers?: number[];
}

interface FormValues {
  answers: number[];
}

export default function SEQuestionnaire({ onComplete, initialAnswers }: Props) {
  const [result, setResult] = useState<number | null>(null);

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { answers: initialAnswers ?? Array(QUESTIONS.length).fill(undefined) },
  });

  const answers = watch('answers');
  const completedCount = answers.filter((a) => a !== undefined).length;

  function onSubmit(data: FormValues) {
    const avg = data.answers.reduce((sum, v) => sum + v, 0) / data.answers.length;
    setResult(avg);
    onComplete(data.answers);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1e1b4b]">自我效能感量表 (GSES)</h2>
        <span className="text-xs text-[#6b6893] bg-[#f0edff] px-2.5 py-1 rounded-full">
          {completedCount}/{QUESTIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#e0d7fe] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#5244c2] to-[#7a32e0] rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${(completedCount / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {QUESTIONS.map((q, i) => (
        <fieldset key={i} className="mb-5 border-0 p-0">
          <legend className="font-semibold text-sm text-[#1e1b4b] mb-2">
            {i + 1}. {q}
          </legend>
          <Controller
            name={`answers.${i}`}
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                      field.value === opt.value
                        ? 'bg-[#5244c2] text-white'
                        : 'bg-[#f8f7ff] text-[#6b6893] hover:bg-[#e0d7fe]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={opt.value}
                      checked={field.value === opt.value}
                      onChange={() => field.onChange(opt.value)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
                {fieldState.error && (
                  <span className="text-[#ef4444] text-xs self-center">必答</span>
                )}
              </div>
            )}
          />
        </fieldset>
      ))}

      {result !== null && (
        <div className="mt-4 p-4 bg-[#f0edff] border border-[#e0d7fe] rounded-xl">
          <p className="text-sm text-[#1e1b4b]">
            自我效能感得分 <span className="font-bold text-lg text-[#5244c2]">{result.toFixed(2)}</span>
            <span className="text-[#6b6893]"> / 4.00</span>
          </p>
          <p className="text-xs text-[#a78bfa] mt-1">前端预览，以后端为准</p>
        </div>
      )}

      <div className="mt-6">
        <Button type="submit" disabled={completedCount !== QUESTIONS.length}>
          下一步 →
        </Button>
      </div>
    </form>
  );
}
