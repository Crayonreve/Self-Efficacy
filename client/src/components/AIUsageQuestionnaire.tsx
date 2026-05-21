import { useForm, Controller } from 'react-hook-form';
import Button from './ui/Button';

const FREQUENCY_OPTIONS = [
  { value: 1, label: '0次' },
  { value: 2, label: '1-2次' },
  { value: 3, label: '3-4次' },
  { value: 4, label: '5-6次' },
  { value: 5, label: '7次及以上' },
];

const AI_CATEGORIES = [
  '辅助写作', '代码生成', '文献检索', '考试复习', '翻译',
  '创意生成', '数据分析', '社交聊天', '生活规划',
];

const PERCEPTION_ITEMS = [
  'AI工具提升了我的学习效率。',
  '我担心过度依赖AI会削弱我的独立思考能力。',
  '使用AI后，我对自己完成困难任务的信心提高了。',
  '没有AI工具的帮助，我对完成课程作业缺乏信心。',
  'AI让我的学习变得更有趣。',
  '我曾因无法使用AI工具而感到焦虑。',
];

const PERCEPTION_OPTIONS = [
  { value: 1, label: '非常不同意' },
  { value: 2, label: '不同意' },
  { value: 3, label: '同意' },
  { value: 4, label: '非常同意' },
];

export interface AIUsageData {
  frequency: number;
  diversity: string[];
  perception: number[];
}

interface Props {
  onComplete: (data: AIUsageData) => void;
  onBack: () => void;
}

interface FormValues {
  frequency: number;
  diversity: string[];
  perception: number[];
}

export default function AIUsageQuestionnaire({ onComplete, onBack }: Props) {
  const { control, handleSubmit, watch, formState } = useForm<FormValues>({
    defaultValues: {
      frequency: undefined as unknown as number,
      diversity: [],
      perception: Array(PERCEPTION_ITEMS.length).fill(undefined),
    },
  });

  const diversityValues: string[] = watch('diversity');
  const perceptionValues: number[] = watch('perception');
  const perceptionDone = perceptionValues.filter((v) => v !== undefined).length;
  const allValid =
    formState.dirtyFields.frequency &&
    diversityValues.length > 0 &&
    perceptionDone === PERCEPTION_ITEMS.length;

  return (
    <form onSubmit={handleSubmit((d) => onComplete(d))}>
      {/* Section 1 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#1e1b4b] mb-1">AI 使用频率</h2>
        <p className="text-sm text-[#6b6893] mb-3">过去一周你使用 AI 工具的频率？</p>
        <Controller
          name="frequency"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="flex flex-wrap gap-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
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
      </div>

      {/* Section 2 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#1e1b4b] mb-1">AI 使用多样性</h2>
        <p className="text-sm text-[#6b6893] mb-3">你使用 AI 工具的主要用途有哪些？（可多选）</p>
        <Controller
          name="diversity"
          control={control}
          rules={{ validate: (v) => v.length > 0 || '至少选择一项' }}
          render={({ field, fieldState }) => (
            <div>
              <div className="flex flex-wrap gap-2">
                {AI_CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                      field.value.includes(cat)
                        ? 'bg-[#5244c2] text-white'
                        : 'bg-[#f8f7ff] text-[#6b6893] hover:bg-[#e0d7fe]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={cat}
                      checked={field.value.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) field.onChange([...field.value, cat]);
                        else field.onChange(field.value.filter((v) => v !== cat));
                      }}
                      className="sr-only"
                    />
                    {cat}
                  </label>
                ))}
              </div>
              {fieldState.error && (
                <p className="text-[#ef4444] text-xs mt-1">{fieldState.error.message}</p>
              )}
              <p className="text-xs text-[#a78bfa] mt-2">
                已选 {field.value.length}/{AI_CATEGORIES.length} 项
              </p>
            </div>
          )}
        />
      </div>

      {/* Section 3 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#1e1b4b] mb-1">AI 影响感知</h2>
        <p className="text-sm text-[#6b6893] mb-3">
          已完成 {perceptionDone}/{PERCEPTION_ITEMS.length}
        </p>
        {PERCEPTION_ITEMS.map((item, i) => (
          <fieldset key={i} className="mb-5 border-0 p-0">
            <legend className="font-semibold text-sm text-[#1e1b4b] mb-2">
              {i + 1}. {item}
            </legend>
            <Controller
              name={`perception.${i}`}
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {PERCEPTION_OPTIONS.map((opt) => (
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
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="ghost" type="button" onClick={onBack}>
          ← 上一页
        </Button>
        <Button type="submit" disabled={!allValid}>
          提交测评
        </Button>
      </div>
    </form>
  );
}
