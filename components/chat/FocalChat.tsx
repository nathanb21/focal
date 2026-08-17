"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { FileSearch, GitPullRequest, Menu, ShieldCheck } from "lucide-react";
import { ChatInput } from "@/components/chat/ChatInput";
import { CitationPanel } from "@/components/chat/CitationPanel";
import { MessageThread } from "@/components/chat/MessageThread";
import type { Citation, StoredChat, StoredMessage } from "@/lib/types";

type FocalChatProps = {
  chat: StoredChat;
  onOpenSidebar?: () => void;
  onMessagesChange: (messages: StoredMessage[]) => void;
  onTitleChange: (title: string) => void;
};

function messageText(message: { parts?: Array<{ type: string; text?: string }>; content?: string }) {
  if (message.parts) {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("");
  }
  return message.content ?? "";
}

export function FocalChat({ chat, onOpenSidebar, onMessagesChange, onTitleChange }: FocalChatProps) {
  const [input, setInput] = useState("");
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [citationPanelOpen, setCitationPanelOpen] = useState(false);
  const hadUserMessageOnMount = useRef(chat.messages.some((message) => message.role === "user"));
  const titleRequestMessageId = useRef<string | null>(null);

  const initialMessages = useMemo(
    () =>
      chat.messages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: [{ type: "text" as const, text: message.content }],
      })),
    [chat.messages],
  );

  const { messages, sendMessage, status } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isStreaming = status === "submitted" || status === "streaming";

  useEffect(() => {
    const nextMessages: StoredMessage[] = messages.map((message, index) => ({
      id: message.id || `${chat.id}-${index}`,
      role: message.role === "user" ? "user" : "assistant",
      content: messageText(message),
      createdAt: new Date().toISOString(),
    }));
    onMessagesChange(nextMessages);
    // The parent callback is intentionally not a dependency: it is stable for a chat instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, chat.id]);

  useEffect(() => {
    if (hadUserMessageOnMount.current || chat.titleEdited) return;

    const firstUserMessage = messages.find((message) => message.role === "user");
    if (!firstUserMessage || titleRequestMessageId.current === firstUserMessage.id) return;

    titleRequestMessageId.current = firstUserMessage.id;
    const message = messageText(firstUserMessage);

    void fetch("/api/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
      .then(async (response) => {
        if (!response.ok) return;
        const result = (await response.json()) as { title?: string };
        if (result.title?.trim()) onTitleChange(result.title.trim());
      })
      .catch(() => undefined);
  }, [chat.titleEdited, messages, onTitleChange]);

  const submit = (prompt = input) => {
    const trimmed = prompt.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const openCitation = (citation: Citation) => {
    setSelectedCitation(citation);
    setCitationPanelOpen(true);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/70 px-5 backdrop-blur sm:px-8 lg:px-12">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-800">{chat.title}</p>
            <p className="mt-1 hidden text-[10px] text-slate-400 sm:block">Citations included with every answer</p>
          </div>
        </div>
        <div className="ml-6 hidden shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-500 sm:flex">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Controlled workspace</span>
        </div>
      </header>

      {messages.length === 0 ? (
        <EmptyState onPrompt={submit} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessageThread
            messages={messages.map((message, index) => ({
              id: message.id || `${chat.id}-${index}`,
              role: message.role === "user" ? "user" : "assistant",
              content: messageText(message),
              createdAt: new Date().toISOString(),
            }))}
            isStreaming={isStreaming}
            onCitation={openCitation}
          />
        </div>
      )}

      <ChatInput value={input} onChange={setInput} onSubmit={() => submit()} disabled={isStreaming} />
      <CitationPanel citation={selectedCitation} open={citationPanelOpen} onOpenChange={setCitationPanelOpen} />
    </div>
  );
}

function EmptyState({ onPrompt }: { onPrompt: (prompt: string) => void }) {
  const prompts = [
    { icon: FileSearch, label: "Batch release readiness", prompt: "What should I verify before final batch disposition?" },
    { icon: GitPullRequest, label: "Deviation patterns", prompt: "What are the recent recurring deviation themes?" },
    { icon: ShieldCheck, label: "SOP coverage", prompt: "Which SOPs govern batch record review?" },
  ];

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 pb-28 pt-12 sm:px-8">
      <div className="w-full max-w-[700px]">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">Query your documentation</p>
          <p className="mx-auto max-w-[490px] text-[13px] leading-6 text-slate-500">Ask questions across batch records, deviations, SOPs, validation protocols, and audit logs.</p>
        </div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Suggested questions</p>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {prompts.map(({ icon: Icon, label, prompt }) => (
            <button key={label} onClick={() => onPrompt(prompt)} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <Icon className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
              <span className="text-[12px] font-semibold text-slate-800">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
