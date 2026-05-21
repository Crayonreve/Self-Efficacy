import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';
import { calculateScores } from '../services/scoring';
import { generateReport } from '../services/ai';

const VALID_TYPES = ['GSES', 'CUAS', 'AI_USAGE', 'FULL_BATTERY'] as const;

const router = Router();
const prisma = new PrismaClient();

// POST /api/assessments — submit new assessment
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  const { type, responses } = req.body;
  if (!type || !VALID_TYPES.includes(type)) {
    res.status(400).json({ error: '无效的测评类型' });
    return;
  }
  if (!responses || typeof responses !== 'object') {
    res.status(400).json({ error: '缺少作答数据' });
    return;
  }

  const { scores, warnings } = calculateScores(type, responses);

  try {
    const record = await prisma.assessment.create({
      data: {
        userId: req.userId!,
        type,
        responses: JSON.parse(JSON.stringify(responses)),
        scores: JSON.parse(JSON.stringify(scores)),
      },
    });
    res.status(201).json({ ...record, warnings });
  } catch (err) {
    res.status(500).json({ error: '保存测评记录失败' });
  }
});

// GET /api/assessments — list assessments for current user
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  const { type } = req.query;
  const where: any = { userId: req.userId! };
  if (type && typeof type === 'string') {
    where.type = type;
  }

  try {
    const records = await prisma.assessment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        scores: true,
        createdAt: true,
      },
    });
    res.json(records);
  } catch {
    res.status(500).json({ error: '获取测评列表失败' });
  }
});

// GET /api/assessments/:id — get assessment detail
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const record = await prisma.assessment.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!record) {
      res.status(404).json({ error: '测评记录不存在' });
      return;
    }
    const { scores: _scores, warnings } = calculateScores(
      record.type as 'GSES' | 'CUAS' | 'AI_USAGE' | 'FULL_BATTERY',
      record.responses as any,
    );
    void _scores;
    res.json({ ...record, warnings });
  } catch {
    res.status(500).json({ error: '获取测评详情失败' });
  }
});

// POST /api/assessments/:id/report — generate AI report
router.post('/:id/report', auth, async (req: AuthRequest, res: Response) => {
  try {
    const record = await prisma.assessment.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!record) {
      res.status(404).json({ error: '测评记录不存在' });
      return;
    }
    const reportText = await generateReport(record.scores as any);
    res.json({ reportText });
  } catch {
    res.status(500).json({ error: '生成报告失败' });
  }
});

export default router;
