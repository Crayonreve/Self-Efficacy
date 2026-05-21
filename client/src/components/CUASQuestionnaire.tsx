import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import Button from './ui/Button';

interface Question {
  text: string;
  dimension: 'academic' | 'emotional';
  reversed: boolean;
}

const QUESTIONS: Question[] = [
  { text: '我能制定合理的学习目标并坚持执行。', dimension: 'academic', reversed: false },
  { text: '我很少制定学习目标。', dimension: 'academic', reversed: true },
  { text: '我有自己的学习方法和计划，并能付诸实践。', dimension: 'academic', reversed: false },
  { text: '我对大学的学习感到无所适从。', dimension: 'academic', reversed: true },
  { text: '我能很好地安排自己的学习时间。', dimension: 'academic', reversed: false },
  { text: '我能发现自己的优点和长处。', dimension: 'emotional', reversed: false },
  { text: '我很少发现自己的优点。', dimension: 'emotional', reversed: true },
  { text: '我总是情绪低落，很难调整过来。', dimension: 'emotional', reversed: true },
  { text: '我对自己的情绪状态比较满意。', dimension: 'emotional', reversed: false },
  { text: '当遇到不顺心的事时，我能很好地调节自己的情绪。', dimension: 'emotional', reversed: false },
];

const OPTIONS = [
  { value: 1, label: '很不同意' },
  { value: 2, label: '不同意' },
  { value: 3, label: '不确定' },
  { value: 4, label: '同意' },
  { value: 5, label: '很同意' },
];

function reverseScore(score: number): number {
  return 6 - score;
}

interface Props {
  onComplete: (answers: number[]) => void;
  onBack: () => void;
  initialAnswers?: number[];
}

interface FormValues {
  answers: number[];
}

export default function CUASQuestionnaire({ onComplete, onBack, initialAnswers }: Props) {
  const [result, setResult] = useState<{
    academic: number;
    emotional: number;
  } | null>(null);

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { answers: initialAnswers ?? Array(QUESTIONS.length).fill(undefined) },
  });

  const answers = watch('answers');
  const completedCount = answers.filter((a) => a !== undefined).length;
  const progress = Math.round((completedCount / QUESTIONS.length) * 100);

  function onSubmit(data: FormValues) {
    const adjusted = data.answers.map((score, i) =>
      QUESTIONS[i].reversed ? reverseScore(score) : score,
    );
    const academic = adjusted
      .filter((_, i) => QUESTIONS[i].dimension === 'academic')
      .reduce((s, v) => s + v, 0) / 5;
    const emotional = adjusted
      .filter((_, i) => QUESTIONS[i].dimension === 'emotional')
      .reduce((s, v) => s + v, 0) / 5;
    setResult({ academic, emotional });
    onComplete(adjusted);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1e1b4b]">大学生适应量表 (CUAS)</h2>
        <span className="text-xs text-[#6b6893] bg-[#f0edff] px-2.5 py-1 rounded-full">
          {completedCount}/{QUESTIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#e0d7fe] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#5244c2] to-[#7a32e0] rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {QUESTIONS.map((q, i) => (
        <fieldset key={i} className="mb-5 border-0 p-0">
          <legend className="font-semibold text-sm text-[#1e1b4b] mb-2">
            {i + 1}. {q.text}
            {q.reversed && (
              <span className="text-[#f59e0b] text-xs ml-2 font-normal">[反向题]</span>
            )}
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
        <div className="mt-4 p-4 bg-[#f0edff] border border-[#e0d7fe] rounded-xl space-y-1">
          <p className="text-sm text-[#1e1b4b]">
            学业适应 <span className="font-bold text-[#5244c2]">{result.academic.toFixed(2)}</span>
            <span className="text-[#6b6893]"> / 5.00</span>
          </p>
          <p className="text-sm text-[#1e1b4b]">
            情绪适应 <span className="font-bold text-[#5244c2]">{result.emotional.toFixed(2)}</span>
            <span className="text-[#6b6893]"> / 5.00</span>
          </p>
          <p className="text-xs text-[#a78bfa]">前端预览，以后端为准</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="ghost" type="button" onClick={onBack}>
          ← 上一页
        </Button>
        <Button type="submit" disabled={completedCount !== QUESTIONS.length}>
          下一步 →
        </Button>
      </div>
    </form>
  );
}
