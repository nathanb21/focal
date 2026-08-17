"use client";

import { useEffect, useMemo, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { Citation, FocalResponse, StoredMessage } from "@/lib/types";

type MessageThreadProps = {
  messages: StoredMessage[];
  isStreaming: boolean;
  onCitation: (citation: Citation) => void;
};

export function parseFocalResponse(content: string): FocalResponse | null {
  try {
    const parsed = JSON.parse(content) as FocalResponse;
    if (!parsed?.answer?.segments || !Array.isArray(parsed.citations)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function MessageThread({ messages, isStreaming, onCitation }: MessageThreadProps) {
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
    <div className="mx-auto w-full max-w-[920px] px-5 pb-32 pt-8 sm:px-8 lg:px-12">
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
              onCitation={onCitation}
            />
          ))}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
