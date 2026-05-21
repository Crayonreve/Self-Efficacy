import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { useChat } from '../contexts/ChatContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const { open, setOpen } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { ...pos };
      e.preventDefault();
    },
    [pos],
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPos({
        x: posStart.current.x + dx,
        y: posStart.current.y + dy,
      });
    }
    function onMouseUp() {
      dragging.current = false;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/chat', {
        message: text,
        context: messages.slice(-20),
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，回复失败，请稍后重试。' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed z-[998] w-[370px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] glass flex flex-col overflow-hidden animate-scale-in"
      style={{ right: 24 - pos.x, bottom: 24 - pos.y }}
    >
      {/* Header — draggable handle */}
      <div
        className="px-5 py-3.5 bg-gradient-to-r from-[#5244c2] to-[#7a32e0] text-white font-semibold text-sm flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a7 7 0 017 7c0 2.25-.84 4.1-2.1 5.4L12 22l-4.9-7.6A7 7 0 015 9a7 7 0 017-7z" />
          </svg>
          效能伙伴
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-white/80 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f0edff] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                <path d="M12 2a7 7 0 017 7c0 2.25-.84 4.1-2.1 5.4L12 22l-4.9-7.6A7 7 0 015 9a7 7 0 017-7z" />
              </svg>
            </div>
            <p className="text-[#a78bfa] text-sm">你好！我是效能伙伴</p>
            <p className="text-[#c4b5f9] text-xs mt-1">有什么可以帮你的？</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed animate-fade-in-up ${
              m.role === 'user'
                ? 'self-end bg-gradient-to-r from-[#5244c2] to-[#7a32e0] text-white rounded-br-md'
                : 'self-start bg-[#f0edff] text-[#1e1b4b] rounded-bl-md'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="self-start flex gap-1.5 px-3.5 py-2.5">
            <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[#e0d7fe] p-3 flex gap-2 bg-white/60">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题..."
          disabled={loading}
          className="flex-1 border-2 border-[#e0d7fe] rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[#5244c2] focus:shadow-[0_0_0_3px_rgba(82,68,194,0.1)] bg-white placeholder:text-[#c4b5f9]"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-[#5244c2] to-[#7a32e0] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_12px_rgba(82,68,194,0.5)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
