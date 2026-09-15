'use client';

import React from 'react';
import AiChatDrawer from '@/components/AiChatDrawer';
import { Bot, Sparkles, BookOpen } from 'lucide-react';

export default function AssistantPortalPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              AI Investigation Assistant Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded cognitive Q&amp;A assistant powered by cross-project feature context, peer distributions, and MoSPI guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gov-900 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>RAG Evidence Engine</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="max-w-4xl mx-auto">
        <AiChatDrawer />
      </div>
    </div>
  );
}
