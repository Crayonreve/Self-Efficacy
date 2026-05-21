import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';
import { analyzeTrend } from '../services/ai';

const router = Router();
const prisma = new PrismaClient();

// GET /api/trend-analysis — history of saved reports
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.trendReport.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      select: { id: true, report: true, createdAt: true },
    });
    res.json(reports);
  } catch {
    res.status(500).json({ error: '获取趋势报告历史失败' });
  }
});

// POST /api/trend-analysis — generate new report
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  const { assessments } = req.body;

  if (!Array.isArray(assessments) || assessments.length < 2) {
    res.status(200).json({
      report: '至少完成2次测评才能生成趋势分析报告。',
      generatedAt: new Date().toISOString(),
      insufficient: true,
    });
    return;
  }

  try {
    const report = await analyzeTrend(assessments);
    const saved = await prisma.trendReport.create({
      data: {
        userId: req.userId!,
        report,
      },
    });
    res.json({ id: saved.id, report, generatedAt: saved.createdAt.toISOString() });
  } catch {
    res.status(500).json({ error: '趋势分析生成失败，请稍后重试。' });
  }
});

export default router;
