import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/user/profile
router.get('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    // Aggregated stats
    const counts = await prisma.assessment.groupBy({
      by: ['type'],
      where: { userId: req.userId! },
      _count: true,
    });

    const latest = await prisma.assessment.findFirst({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      select: { type: true, scores: true, createdAt: true },
    });

    res.json({
      ...user,
      assessmentCounts: Object.fromEntries(counts.map((c) => [c.type, c._count])),
      latestAssessment: latest,
    });
  } catch {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

export default router;
