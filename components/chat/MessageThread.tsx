"use client";

import { useEffect, useMemo, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { Citation, FocalResponse, StoredMessage } from "@/lib/types";

type MessageThreadProps = {
  messages: StoredMessage[];
  isStreaming: boolean;
  workingMessage: string;
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
      if (parsed?.answer?.segments && Array.isArray(parsed.citations)) return parsed;
    } catch {
      // Try the next common response wrapper before falling back to plain text.
    }
  }

  return null;
}

export function MessageThread({ messages, isStreaming, workingMessage, onCitation }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, lastMessage?.content]);

  const parsedMessages = useMemo(
    () => messages.map((message) => ({ message, response: message.role === "assistant" ? parseFocalResponse(message.content) : null })),
    [messages],
  );

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
      <div ref={bottomRef} />
    </div>
  );
}
