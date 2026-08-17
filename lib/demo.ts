import type { FocalResponse } from "./types";

const batchRecord: FocalResponse["citations"][number] = {
  id: "br-4471-b",
  documentId: "BR-4471-B",
  documentType: "Batch Record",
  title: "Batch Record — Lot 4471-B Final Release",
  excerpt:
    '“All critical process parameters remained within approved ranges. Final QA review completed with no open actions impacting release.”',
  page: "p. 12",
  department: "Quality Assurance",
  lastUpdated: "2026-02-14",
  confidence: "high",
};

const deviation: FocalResponse["citations"][number] = {
  id: "dev-1842",
  documentId: "DEV-1842",
  documentType: "Deviation Report",
  title: "Deviation Report — Environmental Monitoring Excursion",
  excerpt:
    '“The excursion was contained to the Grade C staging corridor. No product exposure was identified; CAPA-1842 was opened for sensor placement review.”',
  page: "p. 4",
  department: "Manufacturing Quality",
  lastUpdated: "2026-02-10",
  confidence: "high",
};

const sop: FocalResponse["citations"][number] = {
  id: "sop-0317",
  documentId: "SOP-0317",
  documentType: "Standard Operating Procedure",
  title: "SOP-0317 — Batch Record Review and Disposition",
  excerpt:
    '“The reviewer must confirm reconciliation, critical parameter review, and deviation assessment before the disposition decision is recorded.”',
  page: "p. 7",
  department: "Quality Systems",
  lastUpdated: "2026-01-28",
  confidence: "medium",
};

export const sampleResponse: FocalResponse = {
  answer: {
    segments: [
      {
        type: "text",
        content:
          "Lot 4471-B is ready for final disposition. The batch record shows all critical process parameters remained within approved ranges, and QA review has no open actions that affect release ",
      },
      { type: "citation", citationId: "br-4471-b", label: "BR-4471-B" },
      {
        type: "text",
        content:
          ". One related environmental monitoring deviation was contained and does not indicate product exposure; it remains tracked through CAPA-1842 ",
      },
      { type: "citation", citationId: "dev-1842", label: "DEV-1842" },
      { type: "text", content: "." },
    ],
  },
  citations: [batchRecord, deviation],
};

export function fallbackResponse(question: string): FocalResponse {
  const normalized = question.toLowerCase();

  if (normalized.includes("sop") || normalized.includes("review")) {
    return {
      answer: {
        segments: [
          {
            type: "text",
            content:
              "The current review workflow requires reconciliation, critical parameter review, and a documented deviation assessment before disposition is recorded ",
          },
          { type: "citation", citationId: "sop-0317", label: "SOP-0317" },
          {
            type: "text",
            content:
              ". The procedure assigns the final disposition decision to the designated QA reviewer and requires unresolved actions to be linked before approval.",
          },
        ],
      },
      citations: [sop],
    };
  }

  if (normalized.includes("deviation") || normalized.includes("capa")) {
    return {
      answer: {
        segments: [
          {
            type: "text",
            content:
              "The most relevant record is an environmental monitoring excursion in the Grade C staging corridor. The event was contained without identified product exposure, while sensor placement review is being tracked under CAPA-1842 ",
          },
          { type: "citation", citationId: "dev-1842", label: "DEV-1842" },
          { type: "text", content: "." },
        ],
      },
      citations: [deviation],
    };
  }

  return sampleResponse;
}
