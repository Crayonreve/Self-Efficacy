import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { auth } from './middleware/auth';
import assessmentRoutes from './routes/assessments';
import chatRoutes from './routes/chat';
import userRoutes from './routes/user';
import trendAnalysisRoutes from './routes/trendAnalysis';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Vite proxy makes all /api requests same-origin in dev; restrict in prod
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
    : true,
  credentials: true,
}));
app.use(express.json());

// ── Rate limiter for auth routes ──
const authRateMap = new Map<string, { count: number; resetAt: number }>();
function authRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = authRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    authRateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 8) return false; // max 8 attempts/min per IP
  entry.count++;
  return true;
}

// Cleanup stale rate-limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of authRateMap) {
    if (now > v.resetAt) authRateMap.delete(k);
  }
}, 600_000).unref();

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.post('/api/register', async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!authRateLimit(ip)) {
    res.status(429).json({ error: '请求过于频繁，请稍后再试。' });
    return;
  }

  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: '请填写所有必填字段' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    console.error('Register error:', err.code, err.message);
    if (err.code === 'P2002') {
      res.status(409).json({ error: '注册失败，请稍后重试。' });
      return;
    }
    res.status(500).json({ error: '注册失败，请稍后重试。' });
  }
});

app.post('/api/login', async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!authRateLimit(ip)) {
    res.status(429).json({ error: '请求过于频繁，请稍后再试。' });
    return;
  }

  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: '请填写邮箱和密码' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }

    let valid = false;
    // If stored password is a bcrypt hash, compare with bcrypt
    if (user.password.startsWith('$2')) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plaintext — compare directly, then upgrade to hash
      valid = user.password === password;
      if (valid) {
        const hashed = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashed },
        });
      }
    }

    if (!valid) {
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '登录失败，请稍后重试。' });
  }
});

// Mount route modules
app.use('/api/user', userRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/trend-analysis', trendAnalysisRoutes);

// Legacy /api/me
app.get('/api/me', auth, async (req, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId },
    });
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
