'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Send, Minus, Loader2, Sparkles,
  BarChart3, Package, AlertTriangle, MessageSquare,
  TrendingUp, ShoppingBag, Users, ChevronRight
} from 'lucide-react';

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

const ADMIN_QUICK_REPLIES = [
  "📊 Today's sales summary",
  "📦 Low stock products",
  "🛒 Pending orders count",
  "💬 Unanswered messages",
];

export default function AdminChatbot() {
  const [isOpen, setIsOpen]           = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput]             = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const messagesEndRef                = useRef<HTMLDivElement>(null);
  const inputRef                      = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'bot',
    text: "👋 Hello, Admin! I'm **AdminBot** — your AI business assistant.\n\nI can help you with:\n• Sales & revenue analytics\n• Inventory & stock queries\n• Order management insights\n• Customer & message stats\n\nWhat would you like to know?",
    timestamp: new Date(),
    quickReplies: ADMIN_QUICK_REPLIES,
  }]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('admin_chat_session_id') || undefined;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/chatbot/admin-message', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.sessionId) {
        localStorage.setItem('admin_chat_session_id', data.sessionId);
      }

      const reply = data.message || "I couldn't process that response. Please try again.";
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('AdminBot error:', error);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: "Sorry, I'm having trouble connecting right now 🔌 Please check your connection and try again.",
        timestamp: new Date(),
        quickReplies: ['Try again', ...ADMIN_QUICK_REPLIES.slice(0, 2)],
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatText = (text: string) =>
    text.split('\n').map((line, i) => {
      const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="leading-relaxed mb-0.5" dangerouslySetInnerHTML={{ __html: html }} />;
    });

  const QUICK_ACTIONS = [
    { icon: BarChart3,  label: 'Sales',     msg: "Today's sales summary" },
    { icon: Package,    label: 'Stock',     msg: 'Low stock products' },
    { icon: ShoppingBag, label: 'Orders',   msg: 'Pending orders count' },
    { icon: MessageSquare, label: 'Messages', msg: 'Unanswered messages' },
  ];

  return (
    <>
      {/* ─── FLOATING TRIGGER ─── */}
      {!isOpen && (
        <div className="fixed z-[999]" style={{ bottom: 'max(24px, env(safe-area-inset-bottom, 24px))', right: '16px' }}>
          <div className="absolute inset-0 rounded-full bg-[#164475]/30 animate-ping" />
          <button
            id="admin-chatbot-trigger"
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 bg-gradient-to-br from-[#164475] to-[#0a1b2d] rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#164475]/40 hover:scale-110 transition-all duration-300 outline-none"
            aria-label="Open admin chat"
          >
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </span>
          </button>
        </div>
      )}

      {/* ─── CHAT WINDOW ─── */}
      {isOpen && (
        <div
          className="fixed z-[999] flex flex-col rounded-3xl shadow-2xl border border-[#e2e8f0] bg-white overflow-hidden animate-zoom-in"
          style={{ 
            bottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
            right: '16px',
            width: 'min(360px, calc(100vw - 32px))', 
            height: isMinimized ? '68px' : 'min(560px, calc(100dvh - 100px))', 
            maxHeight: 'calc(100dvh - 80px)',
            transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)' 
          }}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#0a1b2d] to-[#164475]">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#164475] to-[#0a1b2d] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-400 rounded-full border-2 border-[#0a1b2d]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-none">AdminBot</p>
              <p className="text-[#a0bad6] text-xs mt-0.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Business Intelligence · Admin Only
              </p>
            </div>
            <button
              onClick={() => setIsMinimized(p => !p)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8fafc] min-h-0 chat-scroll">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.role === 'bot'
                        ? 'bg-gradient-to-br from-[#164475] to-[#0a1b2d]'
                        : 'bg-[#0a1b2d]'
                    }`}>
                      {msg.role === 'bot'
                        ? <Bot className="w-3.5 h-3.5 text-white" />
                        : <Users className="w-3.5 h-3.5 text-white" />
                      }
                    </div>

                    <div className={`flex flex-col gap-1.5 max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-xs space-y-0.5 ${
                        msg.role === 'bot'
                          ? 'bg-white text-[#0a1b2d] border border-[#e2e8f0] rounded-tl-none shadow-sm'
                          : 'bg-gradient-to-br from-[#164475] to-[#0a1b2d] text-white rounded-tr-none'
                      }`}>
                        {msg.role === 'bot' ? formatText(msg.text) : <p>{msg.text}</p>}
                      </div>

                      {/* Quick replies */}
                      {msg.quickReplies && (
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {msg.quickReplies.map(qr => (
                            <button
                              key={qr}
                              onClick={() => sendMessage(qr)}
                              className="border border-[#164475] text-[#164475] text-[10px] font-semibold px-2.5 py-1 rounded-full hover:bg-[#164475] hover:text-white transition-colors"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="text-[9px] text-[#94a3b8]">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2 items-center">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#164475] to-[#0a1b2d] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-sm">
                      <div className="flex items-center gap-1">
                        {[0, 150, 300].map(d => (
                          <div
                            key={d}
                            className="w-1.5 h-1.5 bg-[#164475] rounded-full animate-bounce"
                            style={{ animationDelay: `${d}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 bg-white border-t border-[#e2e8f0] p-3">
                {/* Quick actions */}
                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  {QUICK_ACTIONS.map(({ icon: Icon, label, msg }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(msg)}
                      className="flex flex-col items-center gap-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0a1b2d] text-[9px] font-semibold py-1.5 rounded-lg transition-colors"
                    >
                      <Icon className="w-3 h-3 text-[#164475]" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form
                  onSubmit={e => { e.preventDefault(); sendMessage(input); }}
                  className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#164475]/30 focus-within:border-[#164475] transition-all"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about your store..."
                    className="flex-1 bg-transparent text-xs text-[#0a1b2d] placeholder-[#94a3b8] outline-none font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="w-7 h-7 rounded-lg bg-[#164475] hover:bg-[#0a1b2d] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {isTyping
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Send className="w-3.5 h-3.5" />
                    }
                  </button>
                </form>

                <p className="text-center text-[9px] text-[#94a3b8] mt-1.5 font-medium">
                  ⚡ AdminBot · <strong className="text-[#164475]">Restricted to Admin</strong>
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
