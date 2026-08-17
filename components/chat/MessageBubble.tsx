"use client";

import { CheckCheck, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { AssistantMark } from "@/components/AssistantMark";
import { CitationTag } from "@/components/chat/CitationTag";
import type { Citation, FocalResponse, StoredMessage } from "@/lib/types";

type MessageBubbleProps = {
  message: StoredMessage;
  response: FocalResponse | null;
  onCitation: (citation: Citation) => void;
  isStreaming?: boolean;
};

export function MessageBubble({ message, response, onCitation, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copyAnswer = async () => {
    const text = response
      ? response.answer.segments.map((segment) => (segment.type === "text" ? segment.content : segment.label)).join("")
      : message.content;
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  if (isUser) {
    return (
      <div className="flex justify-end py-4">
        <div className="max-w-[min(620px,80%)] rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-[13px] leading-6 text-white shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex gap-3 py-5">
      <AssistantMark />
      <div className="min-w-0 max-w-[720px] flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[12px] font-semibold text-slate-900">Focal</span>
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-slate-400">Assistant</span>
        </div>
        {response ? (
          <div className="text-[14px] leading-7 text-slate-700">
            {response.answer.segments.map((segment, index) => {
              if (segment.type === "text") return <span key={`${segment.content}-${index}`}>{segment.content}</span>;
              const citation = response.citations.find((item) => item.id === segment.citationId);
              return citation ? <CitationTag key={`${segment.citationId}-${index}`} label={segment.label} onClick={() => onCitation(citation)} /> : null;
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1 text-[13px] text-slate-400">
            {isStreaming ? (
              <>
                <span className="flex gap-1">
                  <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                  <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:120ms]" />
                  <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:240ms]" />
                </span>
                Searching the document library…
              </>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Unable to format this response.</>
            )}
          </div>
        )}
        <button onClick={copyAnswer} className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-slate-400 opacity-0 transition-opacity hover:text-slate-600 group-hover:opacity-100" aria-label="Copy answer">
          {copied ? <CheckCheck className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy answer"}
        </button>
      </div>
    </div>
  );
}
