"use client";

import { Building, CalendarDays, ExternalLink, FileCheck2, Layers3, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AnimatedSheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Citation } from "@/lib/types";

type CitationPanelProps = {
  citation: Citation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const confidenceStyles = {
  high: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/10",
  low: "bg-slate-100 text-slate-600 ring-slate-500/10",
};

export function CitationPanel({ citation, open, onOpenChange }: CitationPanelProps) {
  const [sourceNoticeVisible, setSourceNoticeVisible] = useState(false);

  useEffect(() => {
    setSourceNoticeVisible(false);
  }, [citation?.id]);

  if (!citation) return null;

  return (
    <AnimatedSheet open={open} onOpenChange={onOpenChange}>
      <SheetContent forceMount className="w-full max-w-[430px] gap-0 p-0 sm:max-w-[430px]">
        <div className="border-b border-slate-100 px-6 pb-5 pt-7">
          <SheetHeader className="pr-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FileCheck2 className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">Source document</span>
            </div>
            <SheetTitle className="text-[18px] leading-6 tracking-[-0.02em]">{citation.title}</SheetTitle>
            <SheetDescription className="mt-2 flex items-center gap-2 text-xs">
              <span>{citation.documentId}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{citation.documentType}</span>
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="rounded-xl border border-blue-100 bg-blue-50/55 p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Relevant excerpt
            </div>
            <blockquote className="text-[13px] leading-6 text-slate-700">{citation.excerpt}</blockquote>
          </div>

          <div className="mt-7">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Document details</p>
            <dl className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
              <DetailRow icon={Layers3} label="Document type" value={citation.documentType} />
              <DetailRow icon={MapPin} label="Location" value={citation.page ?? "Not specified"} />
              <DetailRow icon={Building} label="Department" value={citation.department ?? "Not specified"} />
              <DetailRow
                icon={CalendarDays}
                label="Last updated"
                value={citation.lastUpdated ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(citation.lastUpdated)) : "Not specified"}
              />
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-xs text-slate-500">Relevance confidence</dt>
                <dd>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold capitalize ring-1 ring-inset ${confidenceStyles[citation.confidence ?? "medium"]}`}>
                    {citation.confidence ?? "medium"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-7 rounded-lg bg-slate-50 px-3.5 py-3 text-[11px] leading-5 text-slate-500">
            Focal surfaces the excerpt most relevant to your question. Always confirm critical decisions against your controlled source system.
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-6 py-4">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => setSourceNoticeVisible(true)}
          >
            Open source location
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Button>
          {sourceNoticeVisible && (
            <p role="status" className="mt-2 text-center text-[10px] text-slate-400">
              Source location preview opened.
            </p>
          )}
        </div>
      </SheetContent>
    </AnimatedSheet>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Layers3; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        {label}
      </dt>
      <dd className="text-right text-xs font-medium text-slate-700">{value}</dd>
    </div>
  );
}
