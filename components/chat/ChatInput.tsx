"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 150 ? "auto" : "hidden";
  }, [value]);

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 border-t border-slate-200/60 bg-[hsl(var(--background))] px-6 pb-6 pt-5 sm:px-10 lg:px-14">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim() && !disabled) onSubmit();
        }}
        className="mx-auto max-w-[1120px]"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-soft transition-colors focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100/70">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (value.trim() && !disabled) onSubmit();
              }
            }}
            rows={1}
            disabled={disabled}
            placeholder="Ask anything about your document library…"
            className="max-h-[150px] min-h-[38px] w-full resize-none overflow-y-hidden border-0 bg-transparent px-3 py-2 text-[15px] leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            aria-label="Ask Focal a question"
          />
          <div className="flex items-center justify-between px-2 pt-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="hidden sm:inline">Enter to send</span>
              <span className="hidden text-slate-300 sm:inline">·</span>
              <span className="hidden sm:inline">Shift + Enter for a new line</span>
            </div>
            <button
              type="submit"
              disabled={disabled || !value.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white transition-colors hover:bg-[hsl(215_74%_40%)] disabled:bg-slate-200 disabled:text-slate-400"
              aria-label="Send question"
            >
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
