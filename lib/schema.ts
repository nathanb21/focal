import { z } from "zod";

export const focalResponseSchema = z.object({
  answer: z.object({
    segments: z.array(
      z.union([
        z.object({ type: z.literal("text"), content: z.string() }),
        z.object({
          type: z.literal("citation"),
          citationId: z.string(),
          label: z.string(),
        }),
      ]),
    ),
  }),
  citations: z.array(
    z.object({
      id: z.string(),
      documentId: z.string(),
      documentType: z.string(),
      title: z.string(),
      excerpt: z.string(),
      page: z.string().nullable(),
      department: z.string().nullable(),
      lastUpdated: z.string().nullable(),
      confidence: z.enum(["high", "medium", "low"]).nullable(),
    }),
  ),
});
