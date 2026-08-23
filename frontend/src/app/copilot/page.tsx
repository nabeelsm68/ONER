'use client';
import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const PANEL  = '#0a0a0a';
const BORDER = '#1c1c1c';

const SUGGESTIONS = [
  'What is our biggest environmental risk right now?',
  'What should we fix first?',
  'How much CO₂ could we save with intervention?',
  'What does our water trend look like?',
  'Explain the Furnace #2 anomaly.',
  'What is our MRV readiness score?',
];

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(question: string) {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.copilot(q, history);
      setMessages(prev => [...prev, { role: 'assistant', content: res.response || 'No response.' }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm unable to process your question right now. Please ensure the ONER backend is running and try again. If the issue persists, the AI service may be temporarily unavailable.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-screen p-6" style={{ height: 'calc(100vh - 0px)' }}>

        <div className="mb-4 flex-shrink-0">
          <div className="uppercase tracking-widest text-xs mb-2 flex items-center gap-2" style={{ color: '#555', fontSize: 10 }}>
            <span className="w-3 h-px inline-block" style={{ background: '#e6ff3f' }} />
            Conversational Intelligence
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#f5f5f5', letterSpacing: '-0.01em' }}
          >
            Ask ONER
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8a8a8a' }}>
            Environmental AI Copilot · Powered by facility data + Gemini
          </p>
        </div>

        {/* Chat window */}
        <div
          className="flex-1 rounded-xl overflow-y-auto p-4 space-y-4"
          style={{ background: PANEL, border: `1px solid ${BORDER}` }}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(230,255,63,0.06)', border: '1px solid rgba(230,255,63,0.15)' }}
              >
                <Sparkles size={28} style={{ color: '#e6ff3f' }} />
              </div>
              <div>
                <div className="font-semibold" style={{ color: '#f5f5f5', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                  ONER Environmental Copilot
                </div>
                <p className="text-sm mt-1" style={{ color: '#555' }}>
                  Ask about anomalies, CO₂ trends, interventions, MRV readiness, or facility health.
                </p>
              </div>

              {/* Suggested questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-4">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, color: '#8a8a8a' }}
                    onMouseEnter={e => {
                      (e.currentTarget).style.borderColor = 'rgba(230,255,63,0.25)';
                      (e.currentTarget).style.color = '#f5f5f5';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget).style.borderColor = BORDER;
                      (e.currentTarget).style.color = '#8a8a8a';
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'rgba(230,255,63,0.06)', border: '1px solid rgba(230,255,63,0.15)' }}
                >
                  <Bot size={15} style={{ color: '#e6ff3f' }} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'
                }`}
                style={m.role === 'user'
                  ? { background: 'rgba(230,255,63,0.08)', border: '1px solid rgba(230,255,63,0.20)', color: '#f5f5f5' }
                  : { background: '#111', border: `1px solid ${BORDER}`, color: '#8a8a8a' }
                }
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}
                >
                  <User size={15} style={{ color: '#555' }} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: 'rgba(230,255,63,0.06)', border: '1px solid rgba(230,255,63,0.15)' }}
              >
                <Bot size={15} style={{ color: '#e6ff3f' }} />
              </div>
              <div
                className="rounded-2xl rounded-tl-md px-4 py-3 flex gap-1.5"
                style={{ background: '#111', border: `1px solid ${BORDER}` }}
              >
                {[0, 1, 2].map(n => (
                  <div
                    key={n}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: '#e6ff3f',
                      animation: `statusPulse 1.2s ease-in-out ${n * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-3 flex-shrink-0">
          <div
            className="flex gap-2 items-center rounded-xl overflow-hidden"
            style={{ background: PANEL, border: `1px solid ${BORDER}` }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask about your facility's environmental performance..."
              className="flex-1 bg-transparent px-4 py-3.5 text-sm outline-none"
              style={{ color: '#f5f5f5', caretColor: '#e6ff3f' }}
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="mr-2 px-3 py-2 rounded-xl transition-all duration-200 disabled:opacity-30"
              style={{ background: 'rgba(230,255,63,0.08)', border: '1px solid rgba(230,255,63,0.20)', color: '#e6ff3f' }}
              onMouseEnter={e => {
                if (!loading && input.trim()) (e.currentTarget).style.background = 'rgba(230,255,63,0.15)';
              }}
              onMouseLeave={e => {
                (e.currentTarget).style.background = 'rgba(230,255,63,0.08)';
              }}
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-center mt-2 text-xs" style={{ color: '#333' }}>
            Uses deterministic ONER data analysis · Enhanced by Gemini when API key is configured
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
