export type CitationConfidence = "high" | "medium" | "low";

export type Citation = {
  id: string;
  documentId: string;
  documentType: string;
  title: string;
  excerpt: string;
  page?: string;
  department?: string;
  lastUpdated?: string;
  confidence?: CitationConfidence;
};

export type FocalSegment =
  | { type: "text"; content: string }
  | { type: "citation"; citationId: string; label: string };

export type FocalResponse = {
  answer: { segments: FocalSegment[] };
  citations: Citation[];
};

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type StoredChat = {
  id: string;
  title: string;
  titleEdited?: boolean;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
};
