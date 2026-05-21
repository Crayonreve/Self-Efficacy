// CUAS reverse items: 0-indexed positions 1, 3, 6, 7 (questions 2, 4, 7, 8)
const CUAS_REVERSE = new Set([1, 3, 6, 7]);

export interface ScoresSE {
  selfEfficacy: number;
}

export interface ScoresCUAS {
  academicAdapt: number;
  emotionalAdapt: number;
  totalAdapt: number;
}

export interface ScoresAIUsage {
  aiFrequency: number;
  aiDiversity: number;
  aiPerception: number;
}

export interface ScoresFullBattery extends ScoresSE, ScoresCUAS, ScoresAIUsage {}

export type AssessmentScores = ScoresSE | ScoresCUAS | ScoresAIUsage | ScoresFullBattery;

interface CalcResult {
  scores: AssessmentScores;
  warnings: string[];
}

function calcSE(responses: number[]): CalcResult {
  const warnings: string[] = [];
  if (responses.length !== 10) {
    warnings.push(`SES 期望10题，实际收到 ${responses.length} 题`);
  }
  responses.forEach((v, i) => {
    if (v === undefined || v === null) warnings.push(`SES 第${i + 1}题未作答`);
  });
  const valid = responses.filter((v) => v !== undefined && v !== null);
  const selfEfficacy = valid.length > 0
    ? +(valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(2)
    : 0;
  return { scores: { selfEfficacy }, warnings };
}

function calcCUAS(responses: number[]): CalcResult {
  const warnings: string[] = [];
  if (responses.length !== 10) {
    warnings.push(`CUAS 期望10题，实际收到 ${responses.length} 题`);
  }
  responses.forEach((v, i) => {
    if (v === undefined || v === null) warnings.push(`CUAS 第${i + 1}题未作答`);
  });

  const adjusted = responses.map((score, i) =>
    CUAS_REVERSE.has(i) ? 6 - score : score,
  );

  const academicItems = adjusted.slice(0, 5).filter((v) => !isNaN(v));
  const emotionalItems = adjusted.slice(5, 10).filter((v) => !isNaN(v));
  const allItems = adjusted.filter((v) => !isNaN(v));

  const academicAdapt = academicItems.length > 0
    ? +(academicItems.reduce((s, v) => s + v, 0) / academicItems.length).toFixed(2)
    : 0;
  const emotionalAdapt = emotionalItems.length > 0
    ? +(emotionalItems.reduce((s, v) => s + v, 0) / emotionalItems.length).toFixed(2)
    : 0;
  const totalAdapt = allItems.length > 0
    ? +(allItems.reduce((s, v) => s + v, 0) / allItems.length).toFixed(2)
    : 0;

  return { scores: { academicAdapt, emotionalAdapt, totalAdapt }, warnings };
}

function calcAIUsage(data: { frequency: number; diversity: string[]; perception: number[] }): CalcResult {
  const warnings: string[] = [];
  if (data.frequency === undefined || data.frequency === null) {
    warnings.push('AI使用频率未作答');
  }
  if (!data.diversity || data.diversity.length === 0) {
    warnings.push('AI使用多样性未选择任何项');
  }
  data.perception?.forEach((v, i) => {
    if (v === undefined || v === null) warnings.push(`AI感知第${i + 1}题未作答`);
  });

  const aiFrequency = data.frequency ?? 0;
  const aiDiversity = data.diversity?.length ?? 0;
  const validPerception = (data.perception ?? []).filter((v) => v !== undefined && v !== null);
  const aiPerception = validPerception.length > 0
    ? +(validPerception.reduce((s, v) => s + v, 0) / validPerception.length).toFixed(2)
    : 0;

  return { scores: { aiFrequency, aiDiversity, aiPerception }, warnings };
}

export function calculateScores(
  type: 'GSES' | 'CUAS' | 'AI_USAGE' | 'FULL_BATTERY',
  responses: any,
): { scores: AssessmentScores; warnings: string[] } {
  switch (type) {
    case 'GSES':
      return calcSE(responses as number[]);
    case 'CUAS':
      return calcCUAS(responses as number[]);
    case 'AI_USAGE':
      return calcAIUsage(responses as { frequency: number; diversity: string[]; perception: number[] });
    case 'FULL_BATTERY': {
      const se = calcSE(responses.seResponses ?? []);
      const cuas = calcCUAS(responses.cuasResponses ?? []);
      const ai = calcAIUsage(responses.aiData ?? {});
      return {
        scores: { ...se.scores, ...cuas.scores, ...ai.scores },
        warnings: [...se.warnings, ...cuas.warnings, ...ai.warnings],
      };
    }
    default:
      return { scores: {} as AssessmentScores, warnings: [`未知测评类型: ${type}`] };
  }
}
