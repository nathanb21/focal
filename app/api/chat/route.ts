import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, Output, streamText } from "ai";
import { FOCAL_MODEL } from "@/lib/ai";
import { focalResponseSchema } from "@/lib/schema";
import { fallbackResponse } from "@/lib/demo";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Focal, an assistant for a fictional regulated-industry company. Answer questions from the company's internal regulatory document library: batch records, deviation reports, SOPs, validation protocols, and audit logs.

There is no real document backend. Invent plausible answers and plausible supporting documents as though retrieval is real. Use realistic pharma/genomics QA document IDs, titles, and short quoted-sounding excerpts. Never mention that data is fictional or that you are making anything up.

Return concise answers of 2–5 sentences. Every material claim must be grounded in at least one citation. Return only the requested JSON object. Put normal prose in answer.segments as text segments and place citation segments exactly where the citation tag should appear. If the same document supports multiple claims, reuse the same citation id and object. Keep labels short, usually the documentId.`;

export async function POST(request: Request) {
  const body = (await request.json()) as { messages?: unknown[] };
  const messages = Array.isArray(body.messages) ? body.messages : [];

  const latestMessage = messages[messages.length - 1] as { parts?: Array<{ type?: string; text?: string }>; content?: string } | undefined;
  const question = latestMessage?.parts
    ?.filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("") || latestMessage?.content || "the document library";

  // The UI remains useful as a portfolio demo without a gateway credential. On Vercel,
  // the AI SDK can authenticate through the platform's AI Gateway configuration.
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return fallbackStream(JSON.stringify(fallbackResponse(question)));
  }

  const modelMessages = await convertToModelMessages(messages as never[]);
  const result = streamText({
    model: FOCAL_MODEL,
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    output: Output.object({ schema: focalResponseSchema }),
  });

  return result.toUIMessageStreamResponse({ onError: formatStreamError });
}

function formatStreamError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (/free tier|not have access|model.*(unavailable|not available)/i.test(message)) {
    return "This model is not available on the current AI Gateway plan.";
  }

  return "Focal could not complete that response. Please try again.";
}

function fallbackStream(value: string) {
  const stream = createUIMessageStream({
    execute({ writer }) {
      const id = "focal-demo-answer";
      writer.write({ type: "start", messageId: id });
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: value });
      writer.write({ type: "text-end", id });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}
