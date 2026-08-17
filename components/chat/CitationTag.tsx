"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type CitationTagProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export function CitationTag({ label, onClick, className }: CitationTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mx-0.5 inline-flex translate-y-[-1px] items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 align-baseline text-[10px] font-semibold tracking-[-0.01em] text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200",
        className,
      )}
      aria-label={`Open citation ${label}`}
    >
      {label}
      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
    </button>
  );
}
