'use client';

import React, { useState } from 'react';
import { api, AssistantAnswer } from '@/lib/api';
import { Bot, Send, Sparkles, ShieldAlert, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

interface AiChatDrawerProps {
  projectId?: string;
}

export default function AiChatDrawer({ projectId }: AiChatDrawerProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      sender: 'user' | 'assistant';
      text: string;
      citations?: any[];
      mode?: string;
    }>
  >([
    {
      sender: 'assistant',
      text: projectId
        ? `Hello, Investigator. I am your **Grounded AI Investigation Assistant** for Case \`${projectId}\`. Ask me why this project was prioritized, how its cost compares to peer works, agency delay history, or recommended verification steps.`
        : `Hello, Investigator. I am your **MPLAD-GUARD AI Assistant**. Ask me any question regarding project risk signals, constituency trends, or MoSPI scheme guidelines.`,
    },
  ]);

  const presetQuestions = projectId
    ? [
        'Why was this project prioritized?',
        'How does it compare with similar projects?',
        'What is unusual about this agency?',
        'What should an investigator verify?',
      ]
    : [
        'What are the top prioritized projects in Nalanda?',
        'Which agencies have high delay rates?',
        'What does MoSPI Para 4.12 say about work duplication?',
      ];

  const handleSend = async (qToSend?: string) => {
    const q = (qToSend || question).trim();
    if (!q || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    if (!qToSend) setQuestion('');
    setLoading(true);

    try {
      const res: AssistantAnswer = await api.askAssistant(q, projectId);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer,
          citations: res.evidence_citations,
          mode: res.mode,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error contacting AI service: ${err.message || 'Service unavailable'}. Please verify backend API status.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
      {/* Header */}
      <div className="bg-gov-900 text-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <span>Cognitive Investigation Assistant</span>
              <span className="bg-gov-700 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                RAG-GROUNDED
              </span>
            </h3>
            <p className="text-[10px] text-gov-300">
              Evidence-grounded decision support &bull; Guardrail protected
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                sender: 'assistant',
                text: projectId
                  ? `Investigation context reset for Case \`${projectId}\`. How can I assist?`
                  : 'Context reset. How can I assist?',
              },
            ])
          }
          className="p-1.5 rounded hover:bg-gov-800 text-gov-300 hover:text-white transition"
          title="Clear Chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3 shadow-2xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gov-900 text-white font-medium rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none prose prose-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Evidence Citations */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-gov-600" />
                    <span>Supporting Evidence Citations ({m.citations.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.citations.map((cit, cIdx) => (
                      <span
                        key={cIdx}
                        className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200"
                        title={`${cit.title} (${cit.source})`}
                      >
                        [{cit.evidence_id}]
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">
              {m.sender === 'user' ? 'Investigator' : 'AI Assistant (Grounded)'}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-gov-600" />
            <span>Retrieving structured context & synthesizing evidence...</span>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="p-2 bg-slate-100/70 border-t border-slate-200 flex flex-wrap gap-1">
        {presetQuestions.map((qText, qIdx) => (
          <button
            key={qIdx}
            onClick={() => handleSend(qText)}
            className="text-[10px] font-medium bg-white hover:bg-gov-50 text-slate-700 hover:text-gov-800 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs transition flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            <span>{qText}</span>
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question grounded in project evidence..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-gov-600"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-gov-900 hover:bg-gov-800 disabled:opacity-50 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
}
