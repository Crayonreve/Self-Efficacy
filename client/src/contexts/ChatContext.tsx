import { createContext, useContext, useState, type ReactNode } from 'react';

interface ChatState {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const ChatContext = createContext<ChatState | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  return (
    <ChatContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatState {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
