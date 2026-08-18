"use client";

import { useEffect, useMemo, useRef } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { AssistantMark } from "@/components/AssistantMark";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { Citation, FocalResponse, StoredMessage } from "@/lib/types";

type MessageThreadProps = {
  messages: StoredMessage[];
  isStreaming: boolean;
  workingMessage: string;
  errorMessage?: string;
  onRetry: () => void;
  onCitation: (citation: Citation) => void;
};

export function parseFocalResponse(content: string): FocalResponse | null {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const candidates = [
    trimmed,
    trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim(),
  ];
  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    candidates.push(trimmed.slice(objectStart, objectEnd + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as FocalResponse;
      if (parsed?.answer && Array.isArray(parsed.answer.segments) && Array.isArray(parsed.citations)) return parsed;
    } catch {
      // Try the next common response wrapper before falling back to plain text.
    }
  }

  return null;
}

export function MessageThread({ messages, isStreaming, workingMessage, errorMessage, onRetry, onCitation }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, lastMessage?.content]);

  const parsedMessages = useMemo(() => {
    const visibleMessages = errorMessage && lastMessage?.role === "assistant" && !lastMessage.content.trim()
      ? messages.slice(0, -1)
      : messages;

    return visibleMessages.map((message) => ({
      message,
      response: message.role === "assistant" ? parseFocalResponse(message.content) : null,
    }));
  }, [errorMessage, lastMessage, messages]);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 pb-36 pt-10 sm:px-10 lg:px-14">
      {parsedMessages.length === 0 ? (
        <div className="hidden" />
      ) : (
        <div className="divide-y divide-slate-100/80">
          {parsedMessages.map(({ message, response }, index) => (
            <MessageBubble
              key={message.id || `${message.role}-${index}`}
              message={message}
              response={response}
              isStreaming={isStreaming && index === parsedMessages.length - 1 && message.role === "assistant"}
              workingMessage={workingMessage}
              onCitation={onCitation}
            />
          ))}
        </div>
      )}
      {errorMessage && (
        <div className="mt-5 flex gap-3 border-t border-rose-100 pt-5">
          <AssistantMark />
          <div className="min-w-0 max-w-[840px] flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-900">Focal</span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-rose-500">Error</span>
            </div>
            <div className="flex items-center gap-2 text-[14px] leading-6 text-slate-600">
              <TriangleAlert className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={onRetry} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900">
              <RefreshCw className="h-3 w-3" />
              Try again
            </button>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
