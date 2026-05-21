import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export async function generateReport(scores: {
  selfEfficacy?: number;
  totalAdapt?: number;
  academicAdapt?: number;
  emotionalAdapt?: number;
  aiFrequency?: number;
  aiDiversity?: number;
  aiPerception?: number;
}): Promise<string> {
  const se = scores.selfEfficacy ?? 'N/A';
  const ad = scores.totalAdapt ?? 'N/A';
  const ac = scores.academicAdapt ?? 'N/A';
  const em = scores.emotionalAdapt ?? 'N/A';
  const freq = scores.aiFrequency ?? 'N/A';
  const div = scores.aiDiversity ?? 'N/A';
  const per = scores.aiPerception ?? 'N/A';

  const prompt = `你是一位大学心理辅导专家。请根据以下大一新生的测评结果，生成一份200-300字的反馈报告。结果：
- 自我效能感得分：${se} (满分4)
- 适应性总分：${ad} (满分5)
- 学业适应：${ac}，个人/情绪适应：${em}
- AI使用频率：${freq}/5，多样性：${div}/9，感知：${per}
请指出学生的优势与需要关注的方面，并提供2-3条具体建议，注意语气鼓励且专业。`;

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    max_tokens: 600,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
  });

  return res.choices[0]?.message?.content ?? '报告生成失败，请稍后重试。';
}

interface AssessmentContext {
  latestScores: Record<string, any> | null;
  latestDate: string | null;
  totalAssessments: number;
  scoresSummary: string;
}

function buildSystemPrompt(ctx: AssessmentContext): string {
  let base =
    '你是"效能伙伴"，一个专注提升大学生自我效能感与适应能力的AI助手。你基于班杜拉的社会认知理论、Schlossberg的过渡理论，以及AI时代学习特点，用共情、专业的方式回应用户关于自我效能感、学业压力、适应困难等问题。回答应包含心理学依据和可操作建议，避免过长。';

  if (ctx.latestScores || ctx.totalAssessments > 0) {
    base += '\n\n【当前用户测评数据】';
    base += `\n- 累计完成测评: ${ctx.totalAssessments}次`;
    if (ctx.latestDate) {
      base += `\n- 最近测评时间: ${new Date(ctx.latestDate).toLocaleDateString('zh-CN')}`;
    }
    base += `\n- 最近得分: ${ctx.scoresSummary}`;
    base += '\n请结合以上测评数据回应用户问题。当用户询问自己的情况时，应引用具体分数进行分析。如果用户尚未完成某些测评，请鼓励其完成以获得更全面的分析。';
  }

  return base;
}

export async function chatReply(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  assessmentContext?: AssessmentContext,
): Promise<string> {
  const recentHistory = history.slice(-20);
  const systemPrompt = buildSystemPrompt(assessmentContext ?? {
    latestScores: null,
    latestDate: null,
    totalAssessments: 0,
    scoresSummary: '暂无测评数据',
  });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    max_tokens: 800,
    temperature: 0.7,
    messages,
  });

  return res.choices[0]?.message?.content ?? '抱歉，我暂时无法回复，请稍后再试。';
}

/* ── Trend Analysis ── */

interface AssessmentPoint {
  date: string;
  scores: {
    selfEfficacy?: number;
    academicAdapt?: number;
    emotionalAdapt?: number;
    totalAdapt?: number;
    aiFrequency?: number;
    aiDiversity?: number;
    aiPerception?: number;
  };
}

function trendDirection(first: number, last: number): string {
  const diff = last - first;
  if (diff > 0.3) return '显著上升 ↑';
  if (diff > 0.1) return '轻微上升 ↗';
  if (diff < -0.3) return '显著下降 ↓';
  if (diff < -0.1) return '轻微下降 ↘';
  return '保持稳定 →';
}

export async function analyzeTrend(assessments: AssessmentPoint[]): Promise<string> {
  const first = assessments[0];
  const last = assessments[assessments.length - 1];
  const total = assessments.length;

  // Build data summary
  const dims = [
    { key: 'selfEfficacy', label: '自我效能感', max: 4 },
    { key: 'academicAdapt', label: '学业适应', max: 5 },
    { key: 'emotionalAdapt', label: '情绪适应', max: 5 },
    { key: 'totalAdapt', label: '适应性总分', max: 5 },
    { key: 'aiFrequency', label: 'AI使用频率', max: 5 },
    { key: 'aiDiversity', label: 'AI使用多样性', max: 9 },
    { key: 'aiPerception', label: 'AI影响感知', max: 4 },
  ];

  let summary = `用户共完成 ${total} 次测评。\n`;
  summary += `首次测评: ${new Date(first.date).toLocaleDateString('zh-CN')}\n`;
  summary += `最近测评: ${new Date(last.date).toLocaleDateString('zh-CN')}\n\n各维度变化：\n`;

  for (const d of dims) {
    const v1 = (first.scores as any)[d.key];
    const v2 = (last.scores as any)[d.key];
    if (v1 != null && v2 != null) {
      const diff = +(v2 - v1).toFixed(2);
      const sign = diff > 0 ? '+' : '';
      summary += `- ${d.label}: ${v1} → ${v2} (${sign}${diff}/${d.max}), ${trendDirection(v1, v2)}\n`;
    }
  }

  const systemPrompt = `你是"效能伙伴"AI趋势分析师。根据用户多次自我效能感与适应性测评的历史数据，生成一份200-300字的趋势综合分析报告。报告应包含：

总体趋势概述：主要维度的变化方向（上升/下降/稳定）。
关键发现：指出最显著的改善或恶化维度，结合数据说明。
AI使用与适应的关联：若AI使用频率变化与适应性变化存在同步或反向趋势，加以提醒。
个性化建议：针对当前状态提供2-3条具体行动建议。
语气保持专业、共情、鼓励，避免引起焦虑。
数据如下：
${summary}
请输出纯文本格式，适当使用分段和要点。`;

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    max_tokens: 600,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请根据以上数据生成趋势分析报告。' },
    ],
  }, { timeout: 60000 });

  return res.choices[0]?.message?.content ?? '趋势分析生成失败，请稍后重试。';
}
