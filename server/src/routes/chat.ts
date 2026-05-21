import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';
import { chatReply } from '../services/ai';

const router = Router();
const prisma = new PrismaClient();

// Simple in-memory rate limiter: max 20 requests per minute per user
const rateMap = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup of stale entries
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateMap) {
    if (now > v.resetAt) rateMap.delete(k);
  }
}, 600_000).unref();

function rateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

function formatScores(scores: Record<string, any> | null): string {
  if (!scores) return '暂无测评数据';
  const parts: string[] = [];
  if (scores.selfEfficacy != null) parts.push(`自我效能感: ${Number(scores.selfEfficacy).toFixed(2)}/4.00`);
  if (scores.totalAdapt != null) parts.push(`适应性总分: ${Number(scores.totalAdapt).toFixed(2)}/5.00`);
  if (scores.academicAdapt != null) parts.push(`学业适应: ${Number(scores.academicAdapt).toFixed(2)}/5.00`);
  if (scores.emotionalAdapt != null) parts.push(`情绪适应: ${Number(scores.emotionalAdapt).toFixed(2)}/5.00`);
  if (scores.aiFrequency != null) parts.push(`AI使用频率: ${scores.aiFrequency}/5`);
  if (scores.aiDiversity != null) parts.push(`AI使用多样性: ${scores.aiDiversity}/9`);
  if (scores.aiPerception != null) parts.push(`AI影响感知: ${Number(scores.aiPerception).toFixed(2)}/4.00`);
  return parts.join(', ') || '暂无测评数据';
}

// POST /api/chat
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  const { message, context } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: '消息内容不能为空' });
    return;
  }

  if (!rateLimit(req.userId!)) {
    res.status(429).json({ error: '请求过于频繁，请稍后再试。' });
    return;
  }

  try {
    // Fetch user's latest assessment for context
    const latest = await prisma.assessment.findFirst({
      where: { userId: req.userId!, type: 'FULL_BATTERY' },
      orderBy: { createdAt: 'desc' },
      select: { scores: true, createdAt: true },
    });

    const counts = await prisma.assessment.groupBy({
      by: ['type'],
      where: { userId: req.userId! },
      _count: true,
    });
    const totalAssessments = counts.reduce((sum, c) => sum + c._count, 0);

    const assessmentContext: {
      latestScores: Record<string, any> | null;
      latestDate: string | null;
      totalAssessments: number;
      scoresSummary: string;
    } = {
      latestScores: (latest?.scores as Record<string, any>) ?? null,
      latestDate: latest?.createdAt?.toISOString() ?? null,
      totalAssessments,
      scoresSummary: formatScores(latest?.scores as Record<string, any> | null),
    };

    const reply = await chatReply(message, context ?? [], assessmentContext);
    res.json({ reply });
  } catch {
    res.status(500).json({ error: 'AI回复失败' });
  }
});

export default router;
