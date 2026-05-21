import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || '注册失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] flex items-center justify-center px-4 page-enter">
      <div className="glass-card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#1e1b4b] text-center mb-1">效能追踪</h1>
        <p className="text-sm text-[#6b6893] text-center mb-6">创建你的账号</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1e1b4b] mb-1">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border-2 border-[#e0d7fe] rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:border-[#5244c2] focus:shadow-[0_0_0_3px_rgba(82,68,194,0.1)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e1b4b] mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-2 border-[#e0d7fe] rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:border-[#5244c2] focus:shadow-[0_0_0_3px_rgba(82,68,194,0.1)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e1b4b] mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border-2 border-[#e0d7fe] rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:border-[#5244c2] focus:shadow-[0_0_0_3px_rgba(82,68,194,0.1)]"
            />
          </div>

          {error && (
            <p className="text-[#ef4444] text-sm text-center">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '注册中...' : '注册'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#6b6893] mt-6">
          已有账号？{' '}
          <Link to="/login" className="text-[#5244c2] font-semibold hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
