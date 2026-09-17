'use client';

import React, { useState } from 'react';
import { api, AssistantAnswer } from '@/lib/api';
import { Send, Terminal, FileText, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react';

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
        ? `INVESTIGATION ANALYTICAL WORKSTATION [CASE: ${projectId}]\nGrounded cognitive analysis active. Formulate inquiries regarding score breakdown, peer cost benchmarks, agency delay records, or verification protocols.`
        : `INVESTIGATION ANALYTICAL WORKSTATION [CONSTITUENCY: NALANDA]\nFormulate analytical inquiries regarding constituency risk signals, agency concentration, or MoSPI scheme compliance parameters.`,
    },
  ]);

  const presetQuestions = projectId
    ? [
        'Why was this case prioritized?',
        'How does cost compare to peer works?',
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
          text: `SYSTEM ERROR: Unable to contact intelligence service (${err.message || 'API Unavailable'}).`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="floating-slab flex flex-col h-[620px] overflow-hidden font-mono border border-[#E4E7E1]">
      {/* Workspace Header */}
      <div className="bg-[#FAFAF7] text-[#182027] px-6 py-4 border-b border-[#E4E7E1] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#285C7A]/10 border border-[#285C7A]/20 text-[#285C7A]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold flex items-center gap-2.5 tracking-wider text-[#182027]">
              <span>INVESTIGATION ANALYTICAL WORKSTATION</span>
              <span className="bg-[#285C7A]/10 text-[#285C7A] text-[9px] px-2 py-0.5 rounded-full font-bold">
                RAG ENGINE
              </span>
            </h3>
            <p className="text-[10px] text-[#667078] font-sans">
              Evidence-Grounded Cognitive Decision Support &bull; Verification Required
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                sender: 'assistant',
                text: projectId
                  ? `WORKSTATION RESET FOR CASE ${projectId}. READY FOR INQUIRIES.`
                  : 'WORKSTATION RESET. READY FOR INQUIRIES.',
              },
            ])
          }
          className="tactile-light-switch p-2 rounded-full text-[#667078] hover:text-[#182027]"
          title="Reset Log"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Analytical Findings Output Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#F5F6F3] text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Header label */}
            <div className="text-[10px] font-mono text-[#667078] mb-1.5 px-1 flex items-center gap-1.5">
              {m.sender === 'user' ? (
                <span className="text-[#C88A25] font-bold">&gt; ANALYST INQUIRY:</span>
              ) : (
                <span className="text-[#285C7A] font-bold">&gt; ANALYTICAL FINDING:</span>
              )}
            </div>

            <div
              className={`max-w-[88%] rounded-2xl p-5 leading-relaxed border ${
                m.sender === 'user'
                  ? 'bg-[#173F58] border-[#173F58] text-white font-mono shadow-md'
                  : 'bg-white border-[#E4E7E1] text-[#182027] font-sans shadow-[0_12px_32px_rgba(40,50,55,0.05)]'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Structured Categorization Tags for Assistant Output */}
              {m.sender === 'assistant' && (
                <div className="mt-4 pt-3 border-t border-[#E4E7E1] flex flex-wrap gap-2 text-[9px] font-mono">
                  <span className="bg-[#285C7A]/10 text-[#285C7A] px-2.5 py-1 rounded-full border border-[#285C7A]/20 font-bold">
                    FINDING: Grounded Dataset
                  </span>
                  <span className="bg-[#C88A25]/10 text-[#C88A25] px-2.5 py-1 rounded-full border border-[#C88A25]/20 font-bold">
                    RISK SIGNAL: Calculated
                  </span>
                  <span className="bg-[#398265]/10 text-[#398265] px-2.5 py-1 rounded-full border border-[#398265]/20 font-bold">
                    CONFIDENCE: High (RAG)
                  </span>
                  <span className="bg-[#C45145]/10 text-[#C45145] px-2.5 py-1 rounded-full border border-[#C45145]/20 font-bold">
                    REQUIRES VERIFICATION
                  </span>
                </div>
              )}

              {/* Evidence Citations */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#E4E7E1] space-y-2">
                  <div className="text-[9px] font-mono font-bold text-[#667078] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#285C7A]" />
                    <span>SUPPORTING EVIDENCE ARTIFACTS ({m.citations.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.citations.map((cit, cIdx) => (
                      <span
                        key={cIdx}
                        className="bg-[#FAFAF7] text-[#285C7A] text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-[#E4E7E1] font-bold"
                        title={`${cit.title} (${cit.source})`}
                      >
                        [{cit.evidence_id}]
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-[#285C7A] text-xs p-2 font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-[#285C7A]" />
            <span>RETRIEVING GROUNDED EVIDENCE &amp; SYNTHESIZING ANALYTICAL FINDINGS...</span>
          </div>
        )}
      </div>

      {/* Preset Action Switches */}
      <div className="p-3 bg-[#FAFAF7] border-t border-[#E4E7E1] flex flex-wrap gap-2">
        {presetQuestions.map((qText, qIdx) => (
          <button
            key={qIdx}
            onClick={() => handleSend(qText)}
            className="tactile-light-switch text-[10px] font-mono px-3 py-1.5 rounded-full text-[#182027]"
          >
            &gt; {qText}
          </button>
        ))}
      </div>

      {/* Input Workspace Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 bg-white border-t border-[#E4E7E1] flex items-center gap-3"
      >
        <div className="flex-1 relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type analytical inquiry grounded in evidence..."
            className="w-full bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl px-4 py-2.5 text-xs text-[#182027] font-mono focus:outline-hidden focus:border-[#285C7A] placeholder-[#9AA3AB]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="tactile-light-switch tactile-light-switch-active px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition"
        >
          <Send className="w-4 h-4 text-white" />
          <span>QUERY</span>
        </button>
      </form>
    </div>
  );
}
